# Feature Flags & Caching System Documentation

## Overview

The Doctaura application uses a centralized caching system for feature flags that controls which features are visible to users. Feature flags are fetched from the API and cached in-memory with a configurable TTL (Time-To-Live).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              FeatureFlagsProvider                        │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │           React Context State                    │    │    │
│  │  │  - featureFlags: FeatureFlags                   │    │    │
│  │  │  - isLoaded: boolean                            │    │    │
│  │  │  - updateFeatureFlags()                         │    │    │
│  │  │  - invalidateCache()                            │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              featureFlagsCache (Service)                 │    │
│  │  - In-memory cache with TTL                             │    │
│  │  - API format → Internal format mapping                 │    │
│  │  - Default values for all flags                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `src/services/featureFlagsService.ts` | Cache service, type definitions, default values |
| `src/contexts/FeatureFlagsContext.tsx` | React context provider and hooks |
| `src/components/FeatureRoute.tsx` | Route wrapper that shows "Coming Soon" for disabled features |
| `src/components/ComingSoon.tsx` | "Coming Soon" page component |

## API Format vs Internal Format

The backend API returns feature flags with `Enabled` suffix, but internally we use shorter names:

| API Property (Backend) | Internal Property (Frontend) |
|------------------------|------------------------------|
| `prescriptionsEnabled` | `prescriptions` |
| `medicalRecordsEnabled` | `medicalRecords` |
| `telemedicineEnabled` | `telemedicine` |
| `pharmacyFinderEnabled` | `pharmacyFinder` |
| `medicineFinderEnabled` | `medicineFinder` |
| `appointmentRemindersEnabled` | `appointmentReminders` |

### Type Definitions

```typescript
// API response format (from backend)
interface ApiFeatureFlags {
  prescriptionsEnabled?: boolean;
  medicalRecordsEnabled?: boolean;
  telemedicineEnabled?: boolean;
  pharmacyFinderEnabled?: boolean;
  medicineFinderEnabled?: boolean;
  appointmentRemindersEnabled?: boolean;
}

// Internal format (used in components)
interface FeatureFlags {
  prescriptions: boolean;
  medicalRecords: boolean;
  telemedicine: boolean;
  pharmacyFinder: boolean;
  medicineFinder: boolean;
  appointmentReminders: boolean;
}
```

## Data Flow

1. **App Loads** → FeatureFlagsProvider initializes with cached values (if valid) or defaults
2. **PatientDashboard Mounts** → Fetches `/api/Patients/appointments/summary`
3. **API Response** → Contains `featureFlags` object with `xxxEnabled` properties
4. **updateFeatureFlags()** → Maps API format to internal format, updates cache and context
5. **Components Re-render** → Sidebar, Navigation, etc. read from context and show/hide features

```
PatientDashboard
       │
       ▼ fetch API
   API Response
       │
       ▼ extract featureFlags
  ApiFeatureFlags
       │
       ▼ updateFeatureFlags()
  mergeWithDefaults()
       │
       ▼ maps to internal format
  FeatureFlags
       │
       ├──▶ Cache (featureFlagsCache.set())
       │
       └──▶ Context State (setFeatureFlags())
                 │
                 ▼ triggers re-render
         ┌───────┴───────┐
         │               │
      Sidebar      Navigation
    (hides items)  (hides pharmacy)
```

## Cache Configuration

```typescript
const DEFAULT_CACHE_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: true,
};
```

- **TTL**: Cache expires after 5 minutes
- **Stale-While-Revalidate**: Returns stale data while fetching fresh data

## Default Values

All features default to `true` (enabled) if not specified by the API:

```typescript
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  prescriptions: true,
  medicalRecords: true,
  telemedicine: true,
  pharmacyFinder: true,
  medicineFinder: true,
  appointmentReminders: true,
};
```

## Usage

### Reading Feature Flags in Components

```typescript
import { useFeatureFlags, useFeatureFlag } from '@/contexts/FeatureFlagsContext';

// Get all flags
const { featureFlags, isLoaded } = useFeatureFlags();
if (featureFlags.prescriptions) {
  // Show prescriptions feature
}

// Or check a single flag
const showPrescriptions = useFeatureFlag('prescriptions');
```

### Updating Feature Flags (from API response)

```typescript
const { updateFeatureFlags } = useFeatureFlags();

// After fetching data that contains feature flags
const data = await patientDataService.getAppointmentsSummary();
updateFeatureFlags(data.featureFlags);
```

### Invalidating Cache

```typescript
const { invalidateCache } = useFeatureFlags();

// Force refresh on next load
invalidateCache();
```

### Protecting Routes

```tsx
import FeatureRoute from '@/components/FeatureRoute';

<Route
  path="/medical-records"
  element={
    <ProtectedRoute>
      <FeatureRoute
        featureFlag="medicalRecords"
        featureTitle="Medical Records"
        featureDescription="This feature is coming soon."
      >
        <MedicalRecords />
      </FeatureRoute>
    </ProtectedRoute>
  }
/>
```

## Where Features Are Controlled

| Feature Flag | Controlled In | What It Hides |
|--------------|---------------|---------------|
| `prescriptions` | Sidebar, PatientDashboard, Route | Prescriptions menu item, stats card, prescriptions section |
| `medicalRecords` | Sidebar, PatientDashboard, Route | Medical Records menu item, stats card, quick action button |
| `pharmacyFinder` | Navigation, PatientDashboard | Pharmacy Locator in navbar (desktop & mobile), quick action button |
| `telemedicine` | PatientDashboard | (Currently defined but not actively hiding UI elements) |
| `medicineFinder` | (Not yet implemented) | - |
| `appointmentReminders` | (Not yet implemented) | - |

## Debugging

### Console Logs

The system outputs debug logs to help troubleshoot issues:

```
[PatientDashboard] Raw API response featureFlags: {...}
[FeatureFlagsCache] mergeWithDefaults input: {...}
[FeatureFlagsCache] Merged result: {...}
[FeatureFlags] Updated: {...}
```

### Common Issues

#### 1. Features still showing when disabled

**Symptoms**: API returns `false` but features are still visible

**Check**:
- Console logs to see what API is returning
- Verify property names match (API uses `xxxEnabled`, check mapping in `mergeWithDefaults`)
- Ensure `isLoaded` is `true` before checking flags

**Solution**: If API adds new property names, update `ApiFeatureFlags` interface and `mergeWithDefaults` function.

#### 2. Double API calls on dashboard

**Symptoms**: Network tab shows duplicate requests

**Check**:
- React StrictMode can cause double renders in development
- `fetchedRef` should prevent duplicate fetches

**Solution**: The `fetchedRef` in PatientDashboard prevents this. If still occurring, check if component is remounting.

#### 3. Features flash before hiding

**Symptoms**: Features briefly appear then disappear

**Cause**: Default values are `true`, so features show before API responds

**Solution**: This is by design (optimistic rendering). To change, modify `DEFAULT_FEATURE_FLAGS` to `false`, but this may show "Coming Soon" pages incorrectly if API fails.

#### 4. Cache not updating

**Symptoms**: Old values persist even after API returns new values

**Check**:
- Is `updateFeatureFlags` being called?
- Check console for `[FeatureFlags] Updated:` log

**Solution**: Call `invalidateCache()` to force refresh, or check that the component calling `updateFeatureFlags` is mounted.

## Extending the Cache

The caching system is designed to be extensible. To cache other data:

```typescript
import { globalCache, CACHE_KEYS } from '@/services/featureFlagsService';

// Add new cache key
// In featureFlagsService.ts:
export const CACHE_KEYS = {
  FEATURE_FLAGS: 'feature_flags',
  USER_PREFERENCES: 'user_preferences', // New key
} as const;

// Use generic cache
globalCache.set('user_preferences', data, 10 * 60 * 1000); // 10 min TTL
const cached = globalCache.get<UserPreferences>('user_preferences');
if (globalCache.isValid('user_preferences')) {
  // Use cached data
}
```

## Adding New Feature Flags

When the backend adds new feature flags:

1. **Update `ApiFeatureFlags` interface** in `featureFlagsService.ts`:
```typescript
export interface ApiFeatureFlags {
  // ... existing
  newFeatureEnabled?: boolean;
}
```

2. **Update `FeatureFlags` interface**:
```typescript
export interface FeatureFlags {
  // ... existing
  newFeature: boolean;
}
```

3. **Update `DEFAULT_FEATURE_FLAGS`**:
```typescript
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // ... existing
  newFeature: true,
};
```

4. **Update `mergeWithDefaults` mapping**:
```typescript
const result: FeatureFlags = {
  // ... existing
  newFeature: apiFlags.newFeatureEnabled ?? DEFAULT_FEATURE_FLAGS.newFeature,
};
```

5. **Use in components**:
```typescript
const { featureFlags } = useFeatureFlags();
if (featureFlags.newFeature) {
  // Show feature
}
```

## Testing

To test feature flags locally:

1. **Mock API response** in browser DevTools Network tab
2. **Override in console**:
```javascript
// In browser console (temporary, resets on refresh)
localStorage.setItem('debug_feature_flags', JSON.stringify({
  prescriptions: false,
  medicalRecords: false,
}));
```
3. **Backend configuration**: Ask backend team to toggle flags for your test account
