import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Link
} from "@react-email/components"

interface ConfirmationEmailProps {
    name: string
    contactReasonDisplay: string
}

export default function ConfirmationEmail({
    name,
    contactReasonDisplay
}: ConfirmationEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Thanks for contacting PitLane Travel</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Thanks for reaching out!</Heading>
                    <Section style={section}>
                        <Text style={text}>Hi {name},</Text>
                        <Text style={text}>
                            Thank you for contacting PitLane Travel regarding "{contactReasonDisplay}". We've received your message and our team will review it shortly.
                        </Text>
                        <Text style={text}>
                            We typically respond within 24 hours during business days. During race weekends, we offer extended support hours to ensure you get the assistance you need.
                        </Text>
                        <Hr style={hr} />
                        <Text style={text}>
                            While you wait, you might find these resources helpful:
                        </Text>
                        <Button style={button} href="https://pitlanetravel.com/faq">
                            Check our FAQ
                        </Button>
                        <Button style={button} href="https://pitlanetravel.com/help">
                            Visit Help Center
                        </Button>
                        <Hr style={hr} />
                        <Text style={text}>
                            Need immediate assistance? You can reach us at:
                        </Text>
                        <Text style={contactText}>
                            📞 <Link href="tel:+15551234567" style={link}>+1 (555) 123-4567</Link>
                        </Text>
                        <Text style={footer}>
                            Best regards,<br />
                            The PitLane Travel Team
                        </Text>
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
    marginBottom: "64px",
    borderRadius: "8px"
}

const section = {
    padding: "0 48px"
}

const h1 = {
    color: "#E10600",
    fontSize: "24px",
    fontWeight: "600",
    margin: "40px 0",
    textAlign: "center" as const
}

const text = {
    color: "#525f7f",
    fontSize: "16px",
    margin: "12px 0",
    lineHeight: "1.5"
}

const contactText = {
    color: "#525f7f",
    fontSize: "16px",
    margin: "8px 0",
    lineHeight: "1.5"
}

const button = {
    backgroundColor: "#E10600",
    borderRadius: "5px",
    color: "#fff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "600",
    padding: "12px 20px",
    margin: "8px 8px 8px 0",
    textDecoration: "none",
    textAlign: "center" as const
}

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0"
}

const link = {
    color: "#E10600",
    textDecoration: "none"
}

const footer = {
    color: "#525f7f",
    fontSize: "16px",
    margin: "32px 0 0 0",
    fontStyle: "italic"
} 