import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text
} from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface WaitlistNotificationEmailProps {
  title: string
  message: string
}

export function WaitlistNotificationEmail({
  title,
  message
}: WaitlistNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-20">
            <Heading className="text-2xl font-bold text-gray-900">
              {title}
            </Heading>
            <Text className="mt-4 text-gray-600">{message}</Text>
            <Text className="mt-8 text-gray-600">
              Visit{" "}
              <Link href="https://pitlanetravel.com" className="text-blue-600">
                PitLane Travel
              </Link>{" "}
              to view available tickets.
            </Text>
            <Text className="mt-4 text-sm text-gray-500">
              If you no longer wish to receive these notifications, you can
              manage your preferences in your account settings.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
