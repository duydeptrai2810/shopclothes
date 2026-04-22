const API_URL = "http://localhost:3000/api/catalog";

export const getCategories = async () => {
    const res = await fetch(`${API_URL}/catalog/categories`);
    return await res.json();
}

export const getBrands = async () => {
    const res = await fetch(`${API_URL}/catalog/brands`);
    return await res.json();
}

export const getStyles = async () => {
    const res = await fetch(`${API_URL}/catalog/styles`);
    return await res.json();
}

export const getCatalogDetail = async (type, id) => {
    const res = await fetch(`${API_URL}/catalog/${type}/${id}`);
    return await res.json();
}