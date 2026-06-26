-- Quote requests from the PC builder (customer leads, no login required)
create table if not exists quote_requests (
  id text primary key,
  created_at bigint not null,
  name text not null,
  phone text not null,
  parts_summary text not null,
  part_count int not null,
  total numeric not null,
  build_code text,
  source text default 'builder'
);

create index if not exists quote_requests_created_at_idx on quote_requests (created_at desc);
