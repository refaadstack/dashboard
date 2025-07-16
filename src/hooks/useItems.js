// hooks/useItems.js
import { useState, useEffect } from 'react';
import { projectService } from '../services/api';

export const useProjectDetails = (projectId) => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await projectService.getProjectDetails(projectId);
        setProjectDetails(details);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  return { projectDetails, loading, error };
};

// Alternative hook untuk get items by category dari project details
export const useItemsByProject = (projectId) => {
  const { projectDetails, loading, error } = useProjectDetails(projectId);
  
  const items = projectDetails?.items || [];
  const categories = projectDetails?.categories || [];
  
  // Group items by category
  const itemsByCategory = {};
  items.forEach(item => {
    const categoryId = item.category_id || 'uncategorized';
    if (!itemsByCategory[categoryId]) {
      itemsByCategory[categoryId] = [];
    }
    itemsByCategory[categoryId].push(item);
  });

  return { 
    items: itemsByCategory, 
    categories,
    loading, 
    error 
  };
};