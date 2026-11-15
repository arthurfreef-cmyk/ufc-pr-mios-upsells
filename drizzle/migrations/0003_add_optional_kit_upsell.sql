ALTER TABLE public.fruitfy_orders ADD COLUMN parent_order_id uuid REFERENCES public.fruitfy_orders(id) ON DELETE CASCADE;
ALTER TABLE public.fruitfy_orders ADD COLUMN offer_id text CHECK (offer_id IS NULL OR offer_id = 'kit');
ALTER TABLE public.fruitfy_orders ADD CONSTRAINT fruitfy_orders_offer_parent CHECK ((parent_order_id IS NULL AND offer_id IS NULL) OR (parent_order_id IS NOT NULL AND offer_id = 'kit'));
CREATE INDEX fruitfy_orders_parent_idx ON public.fruitfy_orders(parent_order_id);
DROP INDEX public.fruitfy_orders_active_session_idx;
CREATE UNIQUE INDEX fruitfy_orders_active_session_idx ON public.fruitfy_orders(session_id) WHERE status <> 'failed' AND parent_order_id IS NULL;
CREATE UNIQUE INDEX fruitfy_orders_active_offer_idx ON public.fruitfy_orders(parent_order_id, offer_id) WHERE status <> 'failed';