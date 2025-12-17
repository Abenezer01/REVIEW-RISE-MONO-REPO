
export const metadata = {
    title: 'Page Not Found',
    description: 'Page Not Found'
}

export default function NotFoundLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
