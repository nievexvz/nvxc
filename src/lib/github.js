import axios from 'axios';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_USER = import.meta.env.VITE_GITHUB_USER;
const CDN_REPO = import.meta.env.VITE_CDN_REPO;
const GIST_ID = import.meta.env.VITE_GIST_ID;
const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;

const githubAPI = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

// src/lib/github.js - Update uploadToCDN function
export const uploadToCDN = async (file, fileName) => {
  try {
    console.log('📤 Uploading file:', fileName, 'Size:', file.size, 'bytes');
    
    // Check file size (GitHub limit is 25MB for API uploads)
    if (file.size > 25 * 1024 * 1024) {
      return {
        success: false,
        error: 'File size exceeds GitHub limit of 25MB'
      };
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const content = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );
    
    const response = await githubAPI.put(
      `/repos/${GITHUB_USER}/${CDN_REPO}/contents/${fileName}`,
      {
        message: `Upload ${fileName} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        content: content,
        branch: 'main'
      }
    );
    
    console.log('✅ Upload successful:', response.data.content.download_url);
    return {
      success: true,
      url: response.data.content.download_url,
      sha: response.data.content.sha,
      size: file.size
    };
  } catch (error) {
    console.error('❌ Upload error:', error.response?.data || error.message);
    
    // Handle specific GitHub errors
    let errorMessage = error.response?.data?.message || error.message;
    
    if (errorMessage.includes('large')) {
      errorMessage = 'File terlalu besar untuk GitHub API. Maksimal 25MB.';
    } else if (errorMessage.includes('API rate limit')) {
      errorMessage = 'Rate limit tercapai. Coba lagi nanti.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

export const deleteFromCDN = async (fileName, sha) => {
  try {
    await githubAPI.delete(
      `/repos/${GITHUB_USER}/${CDN_REPO}/contents/${fileName}`,
      {
        data: {
          message: `Delete ${fileName}`,
          sha: sha,
          branch: 'main'
        }
      }
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// URL Shortener Functions
export const getGistData = async () => {
  try {
    const response = await githubAPI.get(`/gists/${GIST_ID}`);
    return JSON.parse(response.data.files['urls.json'].content);
  } catch (error) {
    console.error('Get Gist error:', error);
    return {};
  }
};

export const updateGistData = async (data) => {
  try {
    await githubAPI.patch(`/gists/${GIST_ID}`, {
      files: {
        'urls.json': {
          content: JSON.stringify(data, null, 2)
        }
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Update Gist error:', error);
    return { success: false, error: error.message };
  }
};

// src/lib/github.js - Update bagian createShortURL
export const createShortURL = async (originalUrl, customSlug = null) => {
  try {
    const { v4: uuidv4 } = await import('uuid');
    const slug = customSlug || uuidv4().slice(0, 8);
    
    const gistData = await getGistData();
    
    if (gistData[slug]) {
      return { success: false, error: 'Slug sudah digunakan' };
    }
    
    gistData[slug] = {
      originalUrl,
      createdAt: new Date().toISOString(),
      clicks: 0
    };
    
    const result = await updateGistData(gistData);
    
    if (result.success) {
      return {
        success: true,
        shortUrl: `${window.location.origin}/r/${slug}`,
        slug: slug
      };
    }
    
    return result;
  } catch (error) {
    console.error('Create short URL error:', error);
    return { success: false, error: error.message };
  }
};

export const getOriginalURL = async (slug) => {
  try {
    const gistData = await getGistData();
    return gistData[slug] ? gistData[slug].originalUrl : null;
  } catch (error) {
    console.error('Get original URL error:', error);
    return null;
  }
};

export const incrementClick = async (slug) => {
  try {
    const gistData = await getGistData();
    if (gistData[slug]) {
      gistData[slug].clicks = (gistData[slug].clicks || 0) + 1;
      await updateGistData(gistData);
    }
  } catch (error) {
    console.error('Increment click error:', error);
  }
};
