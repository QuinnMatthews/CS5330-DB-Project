export type Project = {
  id: number;
  name: string;
  manager_first_name: string;
  manager_last_name: string;
  institute_name: string;
  start_date: string; // format: 'YYYY-MM-DD'
  end_date: string;   // format: 'YYYY-MM-DD'
};

export type Field = {
  project_id: number;
  field_name: string;
};
