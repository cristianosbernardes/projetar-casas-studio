
export const createMockCheckoutSession = async (data: { projectId: string; addons: string[] }) => {
    console.log('Creating mock checkout session for:', data);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return a success URL (could be a local page)
    // For now, we'll mimic what a Stripe session creation would return: an ID or URL.
    // We'll return a fake URL that allows the frontend to redirect to a "success" page or show a modal.
    // Since we don't have a success page ready, we can return a flag or handled by client.
    // Let's assume the client expects { url: string }

    return {
        url: '/sucesso-simulado?session_id=mock_123456',
        id: 'cs_test_mock_123'
    };
};
