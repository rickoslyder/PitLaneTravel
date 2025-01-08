import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text
} from "@react-email/components"

interface ContactFormEmailProps {
    name: string
    email: string
    contactReason: string
    contactReasonDisplay: string
    message: string
}

export default function ContactFormEmail({
    name,
    email,
    contactReason,
    contactReasonDisplay,
    message
}: ContactFormEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>New Contact Form Submission from {name}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>New Contact Form Submission</Heading>
                    <Section style={section}>
                        <Text style={text}>
                            <strong>Name:</strong> {name}
                        </Text>
                        <Text style={text}>
                            <strong>Email:</strong> {email}
                        </Text>
                        <Text style={text}>
                            <strong>Topic:</strong> {contactReasonDisplay}
                        </Text>
                        <Hr style={hr} />
                        <Text style={text}>
                            <strong>Message:</strong>
                        </Text>
                        <Text style={text}>{message}</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
}

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px"
}

const section = {
    padding: "0 48px"
}

const h1 = {
    color: "#E10600",
    fontSize: "24px",
    fontWeight: "600",
    margin: "40px 0"
}

const text = {
    color: "#525f7f",
    fontSize: "16px",
    margin: "12px 0"
}

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0"
} 