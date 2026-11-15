DROP INDEX public.fruitfy_orders_unique_session_idx;
CREATE UNIQUE INDEX fruitfy_orders_active_session_idx ON public.fruitfy_orders(session_id) WHERE status <> 'failed';