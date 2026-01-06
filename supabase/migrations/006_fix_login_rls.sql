
CREATE OR REPLACE FUNCTION buscar_usuario_por_email(email_busca TEXT)
RETURNS SETOF usuarios AS $$
BEGIN
  RETURN QUERY SELECT * FROM usuarios WHERE email = email_busca;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
