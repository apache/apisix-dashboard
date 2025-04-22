import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/route/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/route/"!</div>
}
