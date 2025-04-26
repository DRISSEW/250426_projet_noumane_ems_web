import axios from 'axios';
import qs from 'qs';

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

export const getApiKeys = async (username, password) => {
    const data = qs.stringify({
        username: username,
        password: password
    });

    try {
        const response = await axios.post(`${BASE_URL}/user/get.json`, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Cookie': 'PHPSESSID=4959f102f8a79273d8071d1c1a78d5f4'
            },
            withCredentials: false
        });

        // Debug the response
        console.log('API Keys Response:', response);

        // Check if the response has the expected structure
        if (response.data && response.data.apikey_read) {
            return {
                success: true,
                apikey_read: response.data.apikey_read
            };
        } else {
            return {
                success: false,
                message: 'API key not found in response'
            };
        }
    } catch (error) {
        console.error('API Keys Error:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Failed to retrieve API keys');
    }
};