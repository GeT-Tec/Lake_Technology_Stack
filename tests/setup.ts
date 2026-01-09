import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
        };
    },
    usePathname() {
        return '/';
    },
    useSearchParams() {
        return new URLSearchParams();
    },
}));

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
    prisma: {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    },
}));

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

// Global test timeout
jest.setTimeout(10000);
