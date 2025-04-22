import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ssl/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/ssl/"!</div>
}
