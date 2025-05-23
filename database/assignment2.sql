-- INSERT Tony Stark info to account table
INSERT INTO public.account (
	account_firstname,
	account_lastname,
	account_email,
	account_password
) VALUES (
	'Tony',
	'Stark',
	'tony@starkent.com',
	'Iam1ronM@n'
)

-- UPDATE Tony account type to Admin
UPDATE public.account 
SET account_type = 'Admin'
WHERE account_firstname = 'Tony'

-- DELETE Tony from account table
DELETE FROM account
WHERE account_firstname = 'Tony'

-- SET and REPLACE a part of the description
UPDATE inventory 
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_model = 'Hummer'

-- INNER JOIN selection
SELECT inv_make, inv_model, classification.classification_name
FROM inventory
INNER JOIN classification
ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name = 'Sport';

-- SET and REPLACE to add /vehicles into middle of file path
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images', '/images/vehicles'), 
	inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles') 