'use client';

import AdvancedRecipeCraftingNew from '@/components/AdvancedRecipeCraftingNew';
import { withClientTranslations } from '@/components/withClientTranslations';

function Home() {
  return (
    <main className="min-h-screen p-0 font-fredoka">
      <AdvancedRecipeCraftingNew />
    </main>
  );
}

// Export the component wrapped with the client translations HOC
export default withClientTranslations(Home); 