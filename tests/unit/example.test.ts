/**
 * Example unit test file
 * This demonstrates basic testing patterns for the project
 */

describe('Example Unit Tests', () => {
    describe('Basic assertions', () => {
        it('should pass a simple test', () => {
            expect(true).toBe(true);
        });

        it('should handle math operations', () => {
            expect(1 + 1).toBe(2);
        });

        it('should work with strings', () => {
            const greeting = 'Lake Technology Stack';
            expect(greeting).toContain('Lake');
            expect(greeting).toMatch(/Technology/);
        });
    });

    describe('Array operations', () => {
        it('should check array contents', () => {
            const items = ['blockchain', 'web3', 'tokenization'];
            expect(items).toHaveLength(3);
            expect(items).toContain('web3');
        });
    });

    describe('Object operations', () => {
        it('should check object properties', () => {
            const config = {
                network: 'development',
                chainId: 1337,
                enabled: true,
            };

            expect(config).toHaveProperty('network');
            expect(config.chainId).toBe(1337);
            expect(config.enabled).toBeTruthy();
        });
    });

    describe('Async operations', () => {
        it('should handle async functions', async () => {
            const fetchData = () => Promise.resolve({ status: 'ok' });
            const result = await fetchData();
            expect(result.status).toBe('ok');
        });
    });
});
