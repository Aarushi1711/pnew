'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { API_BASE_URL } from '../api-config';

interface ModuleNode {
  id: string;
  orderIndex: number;
  title: string;
  contentType: string;
  status: string;
  starsEarned: number;
  hasMorePractice: boolean;
}

interface StageNode {
  id: string;
  orderIndex: number;
  title: string;
  locked: boolean;
  status: string;
  modules: ModuleNode[];
}

interface TrackNode {
  id: string;
  slug: string;
  title: string;
  orderIndex: number;
  description: string | null;
  status: string;
  stages: StageNode[];
}

interface JourneyMap {
  tracks: TrackNode[];
}

export default function DashboardPage() {
  const { accessToken, setAccessToken } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<JourneyMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      router.push('/');
      return;
    }

    fetch(`${API_BASE_URL}/journey/map`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.message ?? 'Failed to load journey map');
        }
        setData(json);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [accessToken, router]);

  function handleLogout() {
    setAccessToken(null);
    router.push('/');
  }

  if (!accessToken) {
    return null;
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Journey Map</h1>
        <button onClick={handleLogout} className="border rounded px-3 py-1">
          Log out
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {data && (
        <div>
          {data.tracks.map((track) => (
            <section key={track.id} className="mb-6 border-b pb-4">
              <h2 className="text-lg font-semibold">
                {track.title} — track status: {track.status}
              </h2>
              {track.description && <p className="text-sm">{track.description}</p>}

              {track.stages.map((stage) => (
                <div key={stage.id} className="ml-4 mt-3">
                  <h3 className="font-medium">
                    {stage.title} — {stage.locked ? 'LOCKED' : 'UNLOCKED'} (stage status:{' '}
                    {stage.status})
                  </h3>
                  <ul className="ml-4 list-disc">
                    {stage.modules.map((moduleNode) => (
                      <li key={moduleNode.id}>
                        {moduleNode.title} — {moduleNode.status} — {moduleNode.starsEarned}/3
                        stars
                        {moduleNode.hasMorePractice ? ' (more practice available)' : ''}
                      </li>
                    ))}
                    {stage.modules.length === 0 && <li>(no modules yet)</li>}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      {data && (
        <details className="mt-6">
          <summary>Raw response</summary>
          <pre className="text-xs whitespace-pre-wrap mt-2 border p-2">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </main>
  );
}
