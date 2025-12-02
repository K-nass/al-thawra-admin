# Features Directory

This directory contains feature-based modules. Each feature should be self-contained with its own components, hooks, and types.

## Structure

```
features/
├── dashboard/
│   ├── components/
│   ├── hooks/
│   ├── types.ts
│   └── Dashboard.tsx
├── posts/
│   ├── components/
│   ├── hooks/
│   ├── types.ts
│   └── Posts.tsx
└── home/
    └── Home.tsx
```

## Guidelines

1. **Keep features isolated**: Each feature should be independent and reusable
2. **Export from index**: Use barrel exports for cleaner imports
3. **Shared code**: Move truly shared components to `/src/components/`
4. **Types**: Feature-specific types go here, global types in `/src/types/`
5. **Hooks**: Feature-specific hooks go here, global hooks in `/src/hooks/`

## Migration (Phase 2)

Files to be moved here:
- Dashboard components from `components/Admin/Dashboard/`
- Post-related components from `components/Admin/Dashboard/DashboardAddPost/`
- Home component from `components/Home/`
