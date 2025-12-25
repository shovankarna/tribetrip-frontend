export async function handleApiResponse(response: Response) {
    if (!response.ok) {
        let errorMessage = 'An unexpected error occurred';
        try {
            const errorData = await response.json();
            // Backend structure: { timestamp, status, error, message, path }
            if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            }
        } catch (e) {
            // If body is not JSON, try text
            const text = await response.text();
            if (text) {
                errorMessage = text;
            } else {
                errorMessage = `Error ${response.status}: ${response.statusText}`;
            }
        }
        throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    // Attempt to parse JSON
    try {
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (e) {
        return null;
    }
}
