export type Project = {
  name: string;
  manager_first: string;
  manager_last: string;
  institute: string;
  start_date: Date;
  end_date: Date;
  fields: string[];
};

export type Field = {
  project_name: string;
  name: string;
};
