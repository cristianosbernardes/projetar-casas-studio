-- Add status column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';

-- Update existing projects to be published (redundant with default but good for clarity)
UPDATE projects SET status = 'published' WHERE status IS NULL;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
