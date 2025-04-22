import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/secret/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/secret/"!</div>
}
