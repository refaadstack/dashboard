import { projectService } from '../services/api';
import { useApi } from './useApi';

export const useProjects = () => {
  return useApi(projectService.getAllProjects);
};

