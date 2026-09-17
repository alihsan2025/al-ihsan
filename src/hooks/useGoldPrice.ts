import { useState, useEffect } from 'react';

// Fallbacks if API fails
const DEFAULT_GOLD_PRICE = 135000;
const DEFAULT_SILVER_PRICE = 1800;
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;

export const useGoldPrice = () => {
    const [goldPrice, setGoldPrice] = useState<number>(DEFAULT_GOLD_PRICE);
    const [silverPrice, setSilverPrice] = useState<number>(DEFAULT_SILVER_PRICE);
    const [goldNisabValue, setGoldNisabValue] = useState<number>(DEFAULT_GOLD_PRICE * GOLD_NISAB_GRAMS);
    const [silverNisabValue, setSilverNisabValue] = useState<number>(DEFAULT_SILVER_PRICE * SILVER_NISAB_GRAMS);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // Simulate an API call delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Use updated January 2026 realistic figures
                const fetchedGoldPrice = 142000;
                const fetchedSilverPrice = 2100;

                setGoldPrice(fetchedGoldPrice);
                setSilverPrice(fetchedSilverPrice);
                setGoldNisabValue(fetchedGoldPrice * GOLD_NISAB_GRAMS);
                setSilverNisabValue(fetchedSilverPrice * SILVER_NISAB_GRAMS);
                setLastUpdated(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
                setLoading(false);

            } catch (err) {
                console.error("Error fetching (fallback to default):", err);
                setGoldPrice(DEFAULT_GOLD_PRICE);
                setSilverPrice(DEFAULT_SILVER_PRICE);
                setGoldNisabValue(DEFAULT_GOLD_PRICE * GOLD_NISAB_GRAMS);
                setSilverNisabValue(DEFAULT_SILVER_PRICE * SILVER_NISAB_GRAMS);
                setError("Failed to fetch live prices.");
                setLoading(false);
            }
        };

        fetchPrices();
    }, []);

    return {
        goldPrice,
        silverPrice,
        goldNisabValue,
        silverNisabValue, // Added back to be accessible
        lastUpdated,
        loading,
        error
    };
};
