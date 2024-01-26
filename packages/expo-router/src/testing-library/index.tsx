/// <reference types="../../types/jest" />
import './expect';

import { act, render, RenderResult, screen } from '@testing-library/react-native';
import path from 'path';
import React from 'react';

import {
  FileStub,
  inMemoryContext,
  requireContext,
  requireContextWithOverrides,
} from './context-stubs';
import { setInitialUrl } from './mocks';
import { ExpoRoot } from '../ExpoRoot';
import getPathFromState from '../fork/getPathFromState';
import { stateCache } from '../getLinkingConfig';
import { store } from '../global-state/router-store';
import { router } from '../imperative-api';

// re-export everything
export * from '@testing-library/react-native';

type RenderRouterOptions = Parameters<typeof render>[1] & {
  initialUrl?: any;
};

type Result = ReturnType<typeof render> & {
  getPathname(): string;
  getPathnameWithParams(): string;
  getSegments(): string[];
  getSearchParams(): Record<string, string | string[]>;
};

function isOverrideContext(
  context: object
): context is { appDir: string; overrides: Record<string, FileStub> } {
  return Boolean(typeof context === 'object' && 'appDir' in context);
}

export function getMockContext(
  context:
    | string
    | Record<string, FileStub>
    | { appDir: string; overrides: Record<string, FileStub> }
) {
  if (typeof context === 'string') {
    return requireContext(path.resolve(process.cwd(), context));
  } else if (isOverrideContext(context)) {
    return requireContextWithOverrides(context.appDir, context.overrides);
  } else {
    return inMemoryContext(context);
  }
}

export function renderRouter(context?: string, options?: RenderRouterOptions): Result;
export function renderRouter(
  context: Record<string, FileStub>,
  options?: RenderRouterOptions
): Result;
export function renderRouter(
  context: { appDir: string; overrides: Record<string, FileStub> },
  options?: RenderRouterOptions
): Result;
export function renderRouter(
  context:
    | string
    | { appDir: string; overrides: Record<string, FileStub> }
    | Record<string, FileStub> = './app',
  { initialUrl = '/', ...options }: RenderRouterOptions = {}
): Result {
  jest.useFakeTimers();

  const mockContext = getMockContext(context);

  // Reset the initial URL
  setInitialUrl(initialUrl);

  // Force the render to be synchronous
  process.env.EXPO_ROUTER_IMPORT_MODE = 'sync';
  stateCache.clear();

  let location: URL | undefined;

  if (typeof initialUrl === 'string') {
    location = new URL(initialUrl, 'test://');
  } else if (initialUrl instanceof URL) {
    location = initialUrl;
  }

  const result = render(<ExpoRoot context={mockContext} location={location} />, {
    ...options,
  });

  return Object.assign(result, {
    getPathname(this: RenderResult): string {
      return store.routeInfoSnapshot().pathname;
    },
    getSegments(this: RenderResult): string[] {
      return store.routeInfoSnapshot().segments;
    },
    getSearchParams(this: RenderResult): Record<string, string | string[]> {
      return store.routeInfoSnapshot().params;
    },
    getPathnameWithParams(this: RenderResult): string {
      return getPathFromState(store.rootState!, store.linking!.config);
    },
  });
}

export const testRouter = {
  /** Navigate to the provided pathname and the pathname */
  navigate(path: string) {
    act(() => router.navigate(path));
    expect(screen).toHavePathnameWithParams(path);
  },
  /** Push the provided pathname and assert the pathname */
  push(path: string) {
    act(() => router.push(path));
    expect(screen).toHavePathnameWithParams(path);
  },
  /** Replace with provided pathname and assert the pathname */
  replace(path: string) {
    act(() => router.replace(path));
    expect(screen).toHavePathnameWithParams(path);
  },
  /** Go back in history and asset the new pathname */
  back(path: string) {
    expect(router.canGoBack()).toBe(true);
    act(() => router.back());
    if (path) {
      expect(screen).toHavePathnameWithParams(path);
    }
  },
  /** If there's history that supports invoking the `back` function. */
  canGoBack() {
    return router.canGoBack();
  },
  /** Update the current route query params and assert the new pathname */
  setParams(params?: Record<string, string>) {
    router.setParams(params);
    if (path) {
      expect(screen).toHavePathnameWithParams(path);
    }
  },
};

export function navigateAndAssert(path: string) {}

export function pushAndAssert(path: string) {
  act(() => router.push(path));
  expect(screen).toHavePathnameWithParams(path);
}

export function backAndAssert(path: string) {}

export function assetCannotGoBack(path: string) {}
