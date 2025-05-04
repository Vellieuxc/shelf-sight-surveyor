
import { Project } from "@/types";
import { ApiService } from "./index";
import { supabase } from "@/integrations/supabase/client";

export interface CreateProjectData {
  title: string;
  description?: string;
  category?: string;
  country: string;
}

/**
 * Service for managing projects
 */
export class ProjectsService extends ApiService<'projects'> {
  constructor() {
    super('projects');
  }
  
  /**
   * Get all projects
   * @returns Promise with array of projects
   */
  async getProjects(): Promise<Project[]> {
    return this.getAll<Project>();
  }
  
  /**
   * Get a specific project by ID
   * @param id Project ID
   * @returns Promise with project details
   */
  async getProject(id: string): Promise<Project> {
    return this.getById<Project>(id);
  }
  
  /**
   * Create a new project
   * @param project Project data
   * @returns Promise with created project
   */
  async createProject(project: CreateProjectData): Promise<Project> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    return this.create<Project, any>({
      ...project,
      created_by: userId
    });
  }
  
  /**
   * Close a project
   * @param id Project ID
   * @returns Promise with updated project
   */
  async closeProject(id: string): Promise<Project> {
    return this.update<Project, any>(id, { is_closed: true });
  }
  
  /**
   * Reopen a project
   * @param id Project ID
   * @returns Promise with updated project
   */
  async reopenProject(id: string): Promise<Project> {
    return this.update<Project, any>(id, { is_closed: false });
  }
  
  /**
   * Get projects by user ID
   * @param userId User ID
   * @returns Promise with array of user's projects
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    return this.query<Project>({ created_by: userId });
  }
}

export const projectsService = new ProjectsService();
