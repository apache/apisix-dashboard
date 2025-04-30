import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/secrets/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/secret/"!</div>
}
