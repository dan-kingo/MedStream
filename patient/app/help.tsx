import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { Card, Divider, useTheme, List } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import Header from '@/src/components/Header';

const faqs = [
  {
    question: "How do I find nearby pharmacies?",
    answer: "The app automatically detects your location and displays nearby pharmacies. You can also manually search by address."
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we use industry-standard encryption to protect all your personal and health information."
  },
  {
    question: "How do I upload a prescription?",
    answer: "Go to the 'Upload Prescription' section and either take a photo or select an existing image from your device."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards and mobile payment options like Apple Pay and Google Pay."
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach us through the 'Contact Us' screen in the app or email support@medimap.com"
  }
];

export default function HelpScreen() {
  const theme = useTheme();
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleFAQ = (id: number) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  return (
    <>
    <Header title="Help Center" showBack />
    <ScrollView 
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <MaterialIcons 
          name="help-outline" 
          size={32} 
          color={theme.colors.primary} 
        />
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Help Center
        </Text>
        <Text style={styles.subtitle}>
          Find answers to common questions
        </Text>
      </View>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          {faqs.map((faq, index) => (
            <View key={index}>
              <List.Accordion
                title={faq.question}
                titleStyle={styles.question}
                expanded={expandedIds.includes(index)}
                onPress={() => toggleFAQ(index)}
                left={props => (
                  <List.Icon 
                    {...props} 
                    icon={expandedIds.includes(index) ? "minus" : "plus"} 
                  />
                )}
              >
                <Text style={[styles.answer, { color: theme.colors.onSurface }]}>
                  {faq.answer}
                </Text>
              </List.Accordion>
              {index < faqs.length - 1 && <Divider />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={styles.helpSection}>
        <Text style={[styles.helpTitle, { color: theme.colors.primary }]}>
          Still need help?
        </Text>
        <Text style={[styles.helpText, { color: theme.colors.onSurface }]}>
          Contact our support team for personalized assistance.
        </Text>
        <List.Item
          title="Contact Support"
          description="We're available 24/7"
          left={props => <List.Icon {...props} icon="email" />}
          onPress={() => Linking.openURL('mailto:support@medimap.com')}
          style={styles.contactItem}
        />
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    borderRadius: 12,
    marginBottom: 20,
  },
  question: {
    fontWeight: '500',
    fontSize: 16,
  },
  answer: {
    padding: 16,
    paddingTop: 0,
    fontSize: 15,
    lineHeight: 22,
  },
  helpSection: {
    marginTop: 10,
    paddingHorizontal: 8,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 15,
    marginBottom: 15,
  },
  contactItem: {
    paddingLeft: 0,
  },
});