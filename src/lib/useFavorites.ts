import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setFavorites(new Set());
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('hotel_id')
      .eq('user_id', user.id);
    if (!error && data) {
      setFavorites(new Set(data.map((r) => r.hotel_id as string)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = useCallback(
    async (hotelId: string) => {
      if (!user) return { needsAuth: true };
      const isFav = favorites.has(hotelId);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(hotelId);
        else next.add(hotelId);
        return next;
      });
      if (isFav) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('hotel_id', hotelId);
      } else {
        await supabase.from('favorites').insert({ hotel_id: hotelId });
      }
      return { needsAuth: false };
    },
    [user, favorites],
  );

  return { favorites, toggle, loading, reload: load };
}
