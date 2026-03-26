import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const HomePage = lazy(async () => {
  const module = await import("../pages/HomePage");
  return { default: module.HomePage };
});

const MyCollectionPage = lazy(async () => {
  const module = await import("../pages/MyCollectionPage");
  return { default: module.MyCollectionPage };
});

const SharedGifPage = lazy(async () => {
  const module = await import("../pages/SharedGifPage");
  return { default: module.SharedGifPage };
});

function RouteFallback() {
  return <p>Loading page...</p>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-collection" element={<MyCollectionPage />} />
        <Route path="/ma-collection" element={<Navigate to="/my-collection" replace />} />
        <Route path="/share/:gifNumber" element={<SharedGifPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
}
