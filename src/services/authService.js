import axios from 'axios';

const BASE_URL = 'http://electricwave.ma/energymonitoring';

export const loginUser = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const response = await axios.post(`${BASE_URL}/user/login.json`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            },
            withCredentials: false // Changed to false to avoid CORS issues
        });

        if (response.data && response.data.success) {
            return {
                success: true,
                sessionid: response.data.sessionid,
                apikey_read: response.data.apikey_read
            };
        }
        return { success: false, message: response.data?.message || 'Login failed' };
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};
