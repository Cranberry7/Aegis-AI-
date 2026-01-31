INSERT INTO "Roles" (id, code, value, "isDeleted", "createdAt", "updatedAt") VALUES
  ('87ba3454-9376-4dbf-b710-57dd5510103a', 'superadmin', 'Super Admin', false, NOW(), NULL),
  ('8c4bc16b-49b0-4ffa-935a-6238ba025db0', 'admin', 'Admin', false, NOW(), NULL),
  ('a3ec0685-8041-4ba0-bfa1-cd486d869501', 'user', 'User', false, NOW(), NULL),
  ('f20e84f5-5fb7-48e8-a59f-c1a577020c09', 'guest', 'Guest', false, NOW(), NULL)
ON CONFLICT (code) DO NOTHING;
