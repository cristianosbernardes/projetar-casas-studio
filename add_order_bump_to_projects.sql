ALTER TABLE projects ADD COLUMN order_bump_id UUID REFERENCES projects(id);
