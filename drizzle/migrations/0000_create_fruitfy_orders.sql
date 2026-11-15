CREATE TABLE public.fruitfy_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 session_id uuid NOT NULL,
 provider_order_id uuid UNIQUE,
 amount integer NOT NULL CHECK (amount > 0),
 customer jsonb NOT NULL,
 address jsonb NOT NULL,
 shipping text NOT NULL CHECK (shipping IN ('pac','sedex')),
 additional boolean NOT NULL DEFAULT false,
 pix_code text,
 status text NOT NULL DEFAULT 'creating' CHECK (status IN ('creating','waiting_payment','pending','paid','refused','partial_refunded','canceled','refunded','chargeback','failed')),
 paid_at timestamptz,
 checked_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz
);
GRANT ALL ON public.fruitfy_orders TO service_role;
REVOKE ALL ON public.fruitfy_orders FROM anon, authenticated;
ALTER TABLE public.fruitfy_orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX fruitfy_orders_session_idx ON public.fruitfy_orders(session_id, created_at);
CREATE INDEX fruitfy_orders_status_idx ON public.fruitfy_orders(status);
COMMENT ON TABLE public.fruitfy_orders IS 'Private guest checkout orders. Only server handlers may access; provider-confirmed payment updates only.';