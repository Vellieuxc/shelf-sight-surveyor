
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
  
  async getProjects() {
    return this.getAll<Project>();
  }
  
  async getProject(id: string) {
    return this.getById<Project>(id);
  }
  
  async createProject(project: CreateProjectData) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    return this.create<Project, CreateProjectData & { created_by: string }>({
      ...project,
      created_by: userId
    });
  }
  
  async closeProject(id: string) {
    return this.update<Project, { is_closed: boolean }>(id, { is_closed: true });
  }
  
  async reopenProject(id: string) {
    return this.update<Project, { is_closed: boolean }>(id, { is_closed: false });
  }
}

export const projectsService = new ProjectsService();
