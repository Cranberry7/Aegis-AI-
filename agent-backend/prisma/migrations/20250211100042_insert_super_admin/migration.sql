-- Step 1: Insert the Account
INSERT INTO "Account" (id, name, "isDeleted", "createdAt", "updatedAt")
VALUES ('d3a7a16c-2b99-4be6-9b91-8f75a21e9a5d', 'Sarvaha Systems', false, NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Insert the SuperAdmin User
INSERT INTO "User" (id, name, email, "roleId", password, "accountId", "nextLoginDate", "isEmailVerified", "isDeleted", "createdAt", "updatedAt")
VALUES (
    '4b1aaf89-3b21-4a79-bdb3-74bf5cb23a8a',
    'Super Admin',
    'rushikesh.saraf@sarvaha.com',
    '87ba3454-9376-4dbf-b710-57dd5510103a',
    'bcb689a9e442f9ddcc14aaf22f6cce6359e4b5151ed6f9ac652cadf87c38a9f9',
    'd3a7a16c-2b99-4be6-9b91-8f75a21e9a5d',
    NOW() + INTERVAL '15 days',
    true,
    false,
    NOW(),
    NULL
)
ON CONFLICT (email) DO NOTHING;
