import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  created_by: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  description?: string;
  color: string;
  position: number;
  is_closed_won: boolean;
  is_closed_lost: boolean;
  created_at: string;
  updated_at: string;
}

export function usePipelines() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;
      setPipelines(data || []);
    } catch (err: any) {
      console.error('Error fetching pipelines:', err);
      setError(err.message);
      toast.error('Failed to load pipelines');
    } finally {
      setLoading(false);
    }
  };

  const createPipeline = async (pipeline: Omit<Pipeline, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pipelines')
        .insert([{ ...pipeline, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Pipeline created successfully');
      await fetchPipelines();
      return data;
    } catch (err: any) {
      console.error('Error creating pipeline:', err);
      toast.error('Failed to create pipeline');
      throw err;
    }
  };

  const updatePipeline = async (id: string, updates: Partial<Pipeline>) => {
    try {
      const { error } = await supabase
        .from('pipelines')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Pipeline updated successfully');
      await fetchPipelines();
    } catch (err: any) {
      console.error('Error updating pipeline:', err);
      toast.error('Failed to update pipeline');
      throw err;
    }
  };

  const deletePipeline = async (id: string) => {
    try {
      // Check if pipeline has opportunities
      const { count } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('pipeline_id', id);

      if (count && count > 0) {
        toast.error(`Cannot delete pipeline with ${count} opportunities. Please reassign them first.`);
        return;
      }

      const { error } = await supabase
        .from('pipelines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Pipeline deleted successfully');
      await fetchPipelines();
    } catch (err: any) {
      console.error('Error deleting pipeline:', err);
      toast.error('Failed to delete pipeline');
      throw err;
    }
  };

  const setDefaultPipeline = async (id: string) => {
    try {
      // Unset all defaults
      await supabase
        .from('pipelines')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Set new default
      const { error } = await supabase
        .from('pipelines')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Default pipeline updated');
      await fetchPipelines();
    } catch (err: any) {
      console.error('Error setting default pipeline:', err);
      toast.error('Failed to set default pipeline');
      throw err;
    }
  };

  const duplicatePipeline = async (id: string, newName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get original pipeline
      const { data: originalPipeline } = await supabase
        .from('pipelines')
        .select('*')
        .eq('id', id)
        .single();

      if (!originalPipeline) throw new Error('Pipeline not found');

      // Create new pipeline
      const { data: newPipeline, error: pipelineError } = await supabase
        .from('pipelines')
        .insert([{
          name: newName,
          description: originalPipeline.description,
          is_default: false,
          is_active: true,
          created_by: user.id,
          organization_id: originalPipeline.organization_id,
        }])
        .select()
        .single();

      if (pipelineError) throw pipelineError;

      // Copy stages
      const { data: originalStages } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', id)
        .order('position');

      if (originalStages && originalStages.length > 0) {
        const newStages = originalStages.map(stage => ({
          pipeline_id: newPipeline.id,
          name: stage.name,
          description: stage.description,
          color: stage.color,
          position: stage.position,
          is_closed_won: stage.is_closed_won,
          is_closed_lost: stage.is_closed_lost,
        }));

        const { error: stagesError } = await supabase
          .from('pipeline_stages')
          .insert(newStages);

        if (stagesError) throw stagesError;
      }

      toast.success('Pipeline duplicated successfully');
      await fetchPipelines();
      return newPipeline;
    } catch (err: any) {
      console.error('Error duplicating pipeline:', err);
      toast.error('Failed to duplicate pipeline');
      throw err;
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  return {
    pipelines,
    loading,
    error,
    fetchPipelines,
    createPipeline,
    updatePipeline,
    deletePipeline,
    setDefaultPipeline,
    duplicatePipeline,
  };
}

export function usePipelineStages(pipelineId: string | null) {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStages = async () => {
    if (!pipelineId) {
      setStages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('position');

      if (error) throw error;
      setStages(data || []);
    } catch (err: any) {
      console.error('Error fetching stages:', err);
      toast.error('Failed to load stages');
    } finally {
      setLoading(false);
    }
  };

  const createStage = async (stage: Omit<PipelineStage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('pipeline_stages')
        .insert([stage]);

      if (error) throw error;
      
      toast.success('Stage created');
      await fetchStages();
    } catch (err: any) {
      console.error('Error creating stage:', err);
      toast.error('Failed to create stage');
      throw err;
    }
  };

  const updateStage = async (id: string, updates: Partial<PipelineStage>) => {
    try {
      const { error } = await supabase
        .from('pipeline_stages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchStages();
    } catch (err: any) {
      console.error('Error updating stage:', err);
      toast.error('Failed to update stage');
      throw err;
    }
  };

  const deleteStage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Stage deleted');
      await fetchStages();
    } catch (err: any) {
      console.error('Error deleting stage:', err);
      toast.error('Failed to delete stage');
      throw err;
    }
  };

  const reorderStages = async (reorderedStages: PipelineStage[]) => {
    try {
      const updates = reorderedStages.map((stage, index) => 
        supabase
          .from('pipeline_stages')
          .update({ position: index + 1 })
          .eq('id', stage.id)
      );

      await Promise.all(updates);
      await fetchStages();
    } catch (err: any) {
      console.error('Error reordering stages:', err);
      toast.error('Failed to reorder stages');
      throw err;
    }
  };

  useEffect(() => {
    fetchStages();
  }, [pipelineId]);

  return {
    stages,
    loading,
    fetchStages,
    createStage,
    updateStage,
    deleteStage,
    reorderStages,
  };
}
