import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnalysisResult, PaymentRecord, ReturnRecord } from '../types';

interface Props {
  result: AnalysisResult | null;
  payments: PaymentRecord[];
  returns: ReturnRecord[];
}

export const AnalysisDisplay: React.FC<Props> = ({ result, payments, returns }) => {
  if (!result) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCard}>
          <Ionicons name="analytics-outline" size={64} color="#A1A1AA" />
          <Text style={styles.emptyTitle}>开始记录你的投入与回报</Text>
          <Text style={styles.emptyHint}>点击底部按钮添加数据</Text>
        </View>
      </View>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 100) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 999) return 'SSS';
    if (score >= 300) return 'SS';
    if (score >= 200) return 'S';
    if (score >= 150) return 'A';
    if (score >= 100) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  };

  const getWittyComment = (score: number, roi: number) => {
    // 白嫖成功
    if (score >= 999) return '传说中的白嫖之神！只有回报没有付出，你赢麻了';

    // 舔狗理论相关点评
    if (score >= 300) return '恭喜脱单！这回报率证明你找对人了';
    if (score >= 200) return '罕见的双向奔赴，建议珍惜';
    if (score >= 150) return '还算有点回应，至少不是单机游戏';
    if (score >= 100) return '勉强达到及格线，但别高兴太早';
    if (score >= 80) return '典型的"我把你当朋友，你却想得更多"';
    if (score >= 60) return '舔狗舔到最后一无所有的前兆';
    if (score >= 40) return '建议阅读《舔狗的自我修养》第三章';
    if (score >= 20) return '你的付出在对方眼里可能只是"烦人"';
    if (score >= 10) return '醒醒吧，人家根本没把你当回事';
    if (score >= 5) return '这不是舔狗，这是跪舔';
    if (score > 0) return '建议立即止损，保留最后的尊严';

    // 没有任何数据
    return '还没有数据，开始记录你的付出与回报吧';
  };

  const getTrendIcon = (score: number) => {
    if (score >= 999) return { name: 'trophy' as const, color: '#F59E0B' };
    if (score >= 150) return { name: 'trending-up' as const, color: '#10B981' };
    if (score >= 100) return { name: 'stats-chart' as const, color: '#10B981' };
    if (score >= 50) return { name: 'remove' as const, color: '#F59E0B' };
    return { name: 'trending-down' as const, color: '#EF4444' };
  };

  return (
    <View style={styles.container}>
      <View style={[styles.heroCard, { borderLeftColor: getScoreColor(result.finalScore) }]}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.heroLabel}>现值性价比</Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.heroScore, { color: getScoreColor(result.finalScore) }]}>
                {result.finalScore.toFixed(0)}
              </Text>
              <View style={[styles.gradeBadge, { backgroundColor: getScoreColor(result.finalScore) }]}>
                <Text style={styles.gradeText}>{getScoreGrade(result.finalScore)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.trendIconContainer}>
            <Ionicons
              name={getTrendIcon(result.finalScore).name}
              size={36}
              color={getTrendIcon(result.finalScore).color}
            />
          </View>
        </View>
        <View style={styles.commentBox}>
          <Text style={styles.commentText}>{getWittyComment(result.finalScore, result.roi)}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardPayment]}>
          <View style={styles.statHeader}>
            <Ionicons name="arrow-down-circle" size={20} color="#EF4444" />
            <Text style={styles.statLabel}>总付出</Text>
          </View>
          <Text style={styles.statValue}>¥{result.totalPayment.toFixed(0)}</Text>
          <Text style={styles.statCount}>{payments.length} 笔</Text>
        </View>
        <View style={[styles.statCard, styles.statCardReturn]}>
          <View style={styles.statHeader}>
            <Ionicons name="arrow-up-circle" size={20} color="#10B981" />
            <Text style={styles.statLabel}>总回报</Text>
          </View>
          <Text style={styles.statValue}>¥{result.totalReturn.toFixed(0)}</Text>
          <Text style={styles.statCount}>{returns.length} 笔</Text>
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>详细分析</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>简单 ROI</Text>
          <Text style={[styles.detailValue, { color: result.roi >= 100 ? '#10B981' : '#EF4444' }]}>
            {result.roi.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>时间加权付出</Text>
          <Text style={styles.detailValue}>{result.timeWeightedPayment.toFixed(0)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>年龄加权回报</Text>
          <Text style={styles.detailValue}>{result.ageWeightedReturn.toFixed(0)}</Text>
        </View>
      </View>

      {(payments.length > 0 || returns.length > 0) && (
        <View style={styles.recordsCard}>
          <View style={styles.recordsHeader}>
            <Ionicons name="time-outline" size={18} color="#71717A" />
            <Text style={styles.recordsTitle}>最近记录</Text>
          </View>
          {payments.slice(-2).reverse().map((p) => (
            <View key={p.id} style={styles.recordItem}>
              <Ionicons name="arrow-down-circle-outline" size={16} color="#EF4444" />
              <View style={styles.recordContent}>
                <Text style={styles.recordDesc} numberOfLines={1}>{p.description}</Text>
                <Text style={styles.recordMeta}>{p.category}</Text>
              </View>
              <Text style={styles.recordPayment}>-¥{p.amount}</Text>
            </View>
          ))}
          {returns.slice(-2).reverse().map((r) => (
            <View key={r.id} style={styles.recordItem}>
              <Ionicons name="arrow-up-circle-outline" size={16} color="#10B981" />
              <View style={styles.recordContent}>
                <Text style={styles.recordDesc} numberOfLines={1}>{r.description}</Text>
                <Text style={styles.recordMeta}>{r.category}</Text>
              </View>
              <Text style={styles.recordReturn}>+¥{r.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    gap: 12
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 6,
    letterSpacing: -0.3
  },
  emptyHint: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '400'
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E4E4E7'
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  heroLabel: {
    fontSize: 12,
    color: '#71717A',
    marginBottom: 8,
    letterSpacing: 0.5,
    fontWeight: '500',
    textTransform: 'uppercase'
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  heroScore: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.5,
    flexShrink: 1
  },
  gradeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gradeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  trendIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center'
  },
  commentBox: {
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7'
  },
  commentText: {
    fontSize: 14,
    color: '#3F3F46',
    lineHeight: 20,
    fontWeight: '400'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    minWidth: 0
  },
  statCardPayment: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  statCardReturn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  statLabel: {
    fontSize: 11,
    color: '#71717A',
    letterSpacing: 0.5,
    fontWeight: '500',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 4,
    letterSpacing: -0.5,
    flexShrink: 1
  },
  statCount: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '400'
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7'
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 16,
    letterSpacing: -0.2
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  detailLabel: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '400'
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
    letterSpacing: -0.1
  },
  divider: {
    height: 1,
    backgroundColor: '#E4E4E7',
    marginVertical: 8
  },
  recordsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E4E4E7'
  },
  recordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  recordsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
    letterSpacing: -0.2
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
    gap: 10
  },
  recordContent: {
    flex: 1,
    marginRight: 12
  },
  recordDesc: {
    fontSize: 14,
    color: '#18181B',
    marginBottom: 3,
    fontWeight: '400',
    flexShrink: 1
  },
  recordMeta: {
    fontSize: 12,
    color: '#71717A'
  },
  recordPayment: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
    letterSpacing: -0.1,
    flexShrink: 0
  },
  recordReturn: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: -0.1,
    flexShrink: 0
  }
});
