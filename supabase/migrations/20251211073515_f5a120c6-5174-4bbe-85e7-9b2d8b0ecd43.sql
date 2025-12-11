-- Update the trigger function to include avatar from user metadata
CREATE OR REPLACE FUNCTION public.create_profile_on_auth_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    name,
    email,
    type,
    avatar,
    goals_count,
    streak,
    achievements,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'parent',
    COALESCE(NEW.raw_user_meta_data ->> 'avatar', 'avatar-1'),
    0,
    0,
    '{"stars": 0, "streak": 0, "recitations": 0, "goalsCompleted": 0}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$function$;