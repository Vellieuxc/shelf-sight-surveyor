
import { Project } from "@/types";
import { ApiService } from "./index";
import { supabase } from "@/integrations/supabase/client";

export interface CreateProjectData {
  title: string;
  description?: string;
  category?: string;
  country: string;
}

export class ProjectsService extends ApiService<'projects'> {
  constructor() {
    super('projects');
  }
  
  /**
   * Get all projects
   * @returns Array of projects
   */
  async getProjects(): Promise<Project[]> {
    return this.getAll<Project>();
  }
  
  /**
   * Get a specific project by ID
   * @param id Project ID
   * @returns Project details
   */
  async getProject(id: string): Promise<Project> {
    return this.getById<Project>(id);
  }
  
  /**
   * Create a new project
   * @param project Project data
   * @returns Created project
   */
  async createProject(project: CreateProjectData): Promise<Project> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    return this.create<Project, CreateProjectData & { created_by: string }>({
      ...project,
      created_by: userId
    });
  }
  
  /**
   * Close a project
   * @param id Project ID
   * @returns Updated project
   */
  async closeProject(id: string): Promise<Project> {
    return this.update<Project>(id, { is_closed: true });
  }
  
  /**
   * Reopen a project
   * @param id Project ID
   * @returns Updated project
   */
  async reopenProject(id: string): Promise<Project> {
    return this.update<Project>(id, { is_closed: false });
  }
  
  /**
   * Get projects by user ID
   * @param userId User ID
   * @returns Array of user's projects
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    return this.query<Project>({ created_by: userId });
  }
}

export const projectsService = new ProjectsService();
