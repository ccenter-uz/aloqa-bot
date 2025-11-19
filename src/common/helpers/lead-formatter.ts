export const leadFormatter = (fullName: string, phone: string, type?: string, title?: string, question?: string) => {
    return `
🆕 New Lead!${type ? `\n📋 Type: ${type}` : ''}${title ? `\n♦️ Title: ${title}` : ''}${question ? `\n❔ Question: ${question}` : ''}
👤 Name: ${fullName}
📞 Phone: ${phone}
`;
};