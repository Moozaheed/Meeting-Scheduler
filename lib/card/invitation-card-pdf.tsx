import { Document, Page, Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';

import type { CardData } from '@/lib/card/card-data';
import { getQrVectorData } from '@/lib/card/qr-vector';

/**
 * The PDF invitation card layout, rendered with @react-pdf/renderer at a
 * fixed US Letter page size (BR5.2 — no A5 option, no host-selectable
 * dimension). Clean typography, a visual hierarchy, an agenda timeline
 * block, and a host-details badge (FR5.1).
 */

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1f2933',
  },
  eyebrow: {
    fontSize: 10,
    color: '#3b5bdb',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    width: 90,
    color: '#52606d',
  },
  metaValue: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d9dfe3',
    paddingBottom: 4,
  },
  agendaRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  agendaOrder: {
    width: 24,
    color: '#3b5bdb',
    fontFamily: 'Helvetica-Bold',
  },
  agendaTopic: {
    flex: 1,
  },
  agendaMeta: {
    width: 140,
    color: '#52606d',
    textAlign: 'right',
  },
  hostBadge: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#eef4ff',
    borderRadius: 6,
  },
  hostName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 48,
    right: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qrCaption: {
    fontSize: 9,
    color: '#52606d',
    maxWidth: 260,
  },
});

interface InvitationCardPdfProps {
  data: CardData;
  qrPayload: string;
}

export function InvitationCardPdf({ data, qrPayload }: InvitationCardPdfProps) {
  const qr = getQrVectorData(qrPayload);

  return (
    <Document title={data.title || 'Meeting invitation'}>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.eyebrow}>You&apos;re invited</Text>
        <Text style={styles.title}>{data.title || 'Untitled meeting'}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Date</Text>
          <Text style={styles.metaValue}>{data.date || 'TBD'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Time</Text>
          <Text style={styles.metaValue}>
            {data.startTime || 'TBD'} – {data.endTime || 'TBD'} ({data.timezone || 'TBD'})
          </Text>
        </View>
        {data.location.trim() !== '' && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Location</Text>
            <Text style={styles.metaValue}>{data.location}</Text>
          </View>
        )}
        {data.meetingLink.trim() !== '' && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Join link</Text>
            <Text style={styles.metaValue}>{data.meetingLink}</Text>
          </View>
        )}
        {data.description.trim() !== '' && (
          <View style={styles.section}>
            <Text>{data.description}</Text>
          </View>
        )}

        {data.agendaItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            {[...data.agendaItems]
              .sort((a, b) => a.order - b.order)
              .map((item, index) => (
                <View style={styles.agendaRow} key={item.id}>
                  <Text style={styles.agendaOrder}>{index + 1}.</Text>
                  <Text style={styles.agendaTopic}>{item.topic}</Text>
                  <Text style={styles.agendaMeta}>
                    {item.speaker ? `${item.speaker} · ` : ''}
                    {item.durationMinutes} min
                  </Text>
                </View>
              ))}
          </View>
        )}

        <View style={styles.hostBadge}>
          <Text style={styles.hostName}>{data.hostName || 'Host'}</Text>
          {data.hostRoleOrg.trim() !== '' && <Text>{data.hostRoleOrg}</Text>}
          <Text>{data.hostEmail}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.qrCaption}>Scan to view meeting details or join.</Text>
          {qr.numCells > 0 && qr.modulesPathData !== '' && (
            <Svg width={80} height={80} viewBox={`0 0 ${qr.numCells} ${qr.numCells}`}>
              <Path d={qr.modulesPathData} fill="#1f2933" />
            </Svg>
          )}
        </View>
      </Page>
    </Document>
  );
}
