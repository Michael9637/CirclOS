-- CirclOS demo seed data for Austrian/Carinthian manufacturing scenario.
-- Run this in Supabase SQL editor.

-- Ensure test company exists for MVP hardcoded company_id.
insert into companies (id, name, sector, location, description)
values (
  '00000000-0000-0000-0000-000000000001',
  'Test Company',
  'wood_processing',
  'Klagenfurt',
  'Test company for development'
)
on conflict (id) do nothing;

-- Additional buyer-side companies for realistic matching.
insert into companies (name, sector, location, description)
values
  ('Carinthia Paper Recovery GmbH', 'paper_recycling', 'Villach', 'Buys clean paper and cardboard side streams from regional suppliers.'),
  ('Alpen Kunststoff Kreislauf KG', 'plastics_recycling', 'Klagenfurt', 'Processes sorted thermoplastics and production offcuts.'),
  ('Drau Metalltechnik GmbH', 'metal_processing', 'Spittal an der Drau', 'Purchases ferrous and non-ferrous metal chips for remelting.'),
  ('Noric Bioenergie AG', 'bioenergy', 'Wolfsberg', 'Uses wood residues and biomass byproducts for district heating fuel.'),
  ('Lavant Tal Baustoffe GmbH', 'construction_materials', 'St. Andra', 'Buys mineral byproducts as substitute raw material.');

-- Seller listings for the test company.
insert into waste_listings (
  company_id, listing_type, material_type, volume_kg_per_month, legal_classification, description, status
)
values
  ('00000000-0000-0000-0000-000000000001', 'seller', 'Holzspane trocken', 1800, 'sekundaerrohstoff', 'Saubere Hobelspane aus Mobelproduktion, trocken gelagert.', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'seller', 'Kunststoffabschnitte PP', 900, 'sekundaerrohstoff', 'Sortenreine PP Produktionsreste, keine Fremdstoffe.', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'seller', 'Metallspane Stahl', 2200, 'abfall', 'Geolte Stahlspane aus CNC Fertigung, regelmassige Mengen.', 'active');

-- Buyer listings linked to inserted companies.
insert into waste_listings (
  company_id, listing_type, material_type, volume_kg_per_month, legal_classification, description, status
)
select c.id, 'buyer', 'Kartonagen und Mischpapier', 2500, 'sekundaerrohstoff',
       'Sucht regionale Papierfasern fur Aufbereitung.', 'active'
from companies c
where c.name = 'Carinthia Paper Recovery GmbH';

insert into waste_listings (
  company_id, listing_type, material_type, volume_kg_per_month, legal_classification, description, status
)
select c.id, 'buyer', 'PP und PE Kunststoffreste', 1600, 'sekundaerrohstoff',
       'Nimmt sortierte Kunststoffe zur Granulatherstellung an.', 'active'
from companies c
where c.name = 'Alpen Kunststoff Kreislauf KG';

insert into waste_listings (
  company_id, listing_type, material_type, volume_kg_per_month, legal_classification, description, status
)
select c.id, 'buyer', 'Stahl- und Edelstahlspane', 3000, 'abfall',
       'Kauft metallische Spane mit nachvollziehbarer Herkunft.', 'active'
from companies c
where c.name = 'Drau Metalltechnik GmbH';

insert into waste_listings (
  company_id, listing_type, material_type, volume_kg_per_month, legal_classification, description, status
)
select c.id, 'buyer', 'Biomasse Reststoffe Holz', 5000, 'sekundaerrohstoff',
       'Sucht Holzreststoffe fur energetische Verwertung.', 'active'
from companies c
where c.name = 'Noric Bioenergie AG';

insert into waste_listings (
  company_id, listing_type, material_type, volume_kg_per_month, legal_classification, description, status
)
select c.id, 'buyer', 'Mineralische Produktionsreste', 4000, 'sekundaerrohstoff',
       'Nutzt mineralische Sekundarrohstoffe als Zuschlag.', 'active'
from companies c
where c.name = 'Lavant Tal Baustoffe GmbH';

-- Optional schema safety checks for MVP.
alter table waste_listings add column if not exists listing_type text default 'seller';
