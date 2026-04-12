import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/kasse/betaling/v2")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(offentlig)/kasse/betaling/v2"!</div>;
}
