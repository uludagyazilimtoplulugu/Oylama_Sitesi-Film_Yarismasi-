CREATE TABLE projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  voter_id text NOT NULL,
  gorsel integer CHECK (gorsel BETWEEN 1 AND 10),
  senaryo integer CHECK (senaryo BETWEEN 1 AND 10),
  yaraticilik integer CHECK (yaraticilik BETWEEN 1 AND 10),
  created_at timestamp DEFAULT now(),
  UNIQUE(project_id, voter_id)
);

CREATE TABLE settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

INSERT INTO settings VALUES ('voting_open', 'false');

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select" ON projects FOR SELECT USING (true);
CREATE POLICY "insert" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "delete" ON projects FOR DELETE USING (true);

CREATE POLICY "select" ON votes FOR SELECT USING (true);
CREATE POLICY "insert" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "delete" ON votes FOR DELETE USING (true);

CREATE POLICY "select" ON settings FOR SELECT USING (true);
CREATE POLICY "update" ON settings FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE projects, votes, settings;
