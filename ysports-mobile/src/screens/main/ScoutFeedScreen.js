import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth } from '../../services/FirebaseConfig';
import {
  View, Text, StyleSheet, Dimensions, Animated,
  PanResponder, TouchableOpacity, ActivityIndicator,
  Modal, Alert, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getFirestore, collection, getDocs, query, orderBy, limit,
  addDoc, doc, where, serverTimestamp,
} from 'firebase/firestore';
import { getApp } from 'firebase/app';

const { width: W, height: H } = Dimensions.get('window');
const SWIPE_THRESHOLD = W * 0.28;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#090b11',
  card:    '#0d1117',
  border:  '#8b2fff',
  primary: '#1a4fff',
  purple:  '#8b2fff',
  gold:    '#c9a227',
  green:   '#00b97a',
  red:     '#e84545',
  cyan:    '#06b6d4',
  sec:     '#4a6fa5',
  white:   '#fff',
  dim:     '#2a3a5a',
  text2:   '#8899bb',
};

// ponytail: accent per sporcu initial — deterministic, no storage needed
const ACCENTS = [C.primary, C.purple, C.gold, C.green, C.red, C.cyan, C.sec];
const accent  = (name) => ACCENTS[(name?.charCodeAt(0) || 0) % ACCENTS.length];

const SPORTS = [
  'Tümü','Futbol','Basketbol','Voleybol','Karate','Boks',
  'Yüzme','Atletizm','Tenis','Güreş','Jimnastik',
];

const SPORT_ICONS = {
  Futbol:'⚽',Basketbol:'🏀',Voleybol:'🏐',Karate:'🥋',Boks:'🥊',
  Yüzme:'🏊',Atletizm:'🏃',Tenis:'🎾',Güreş:'🤼',Jimnastik:'🤸',
};
const sportIcon = (s) => SPORT_ICONS[s] || '⚡';

const CAT = { Karate:'Dövüş', Boks:'Dövüş', Güreş:'Dövüş',
              Futbol:'Takım',  Basketbol:'Takım', Voleybol:'Takım' };
const catOf = (s) => CAT[s] || 'Bireysel';

const sgdColor = (n) => n >= 71 ? C.green : n >= 41 ? C.gold : C.red;

// ─── Corner decoration ────────────────────────────────────────────────────────
function CornerDecor({ color }) {
  const s = 18;
  return (
    <>
      <View style={[cd.corner, cd.tl, { borderColor: color }]} />
      <View style={[cd.corner, cd.tr, { borderColor: color }]} />
      <View style={[cd.corner, cd.bl, { borderColor: color }]} />
      <View style={[cd.corner, cd.br, { borderColor: color }]} />
    </>
  );
}
const cd = StyleSheet.create({
  corner: { position:'absolute', width:18, height:18, borderWidth:2 },
  tl:     { top:10, left:10,   borderRightWidth:0, borderBottomWidth:0 },
  tr:     { top:10, right:10,  borderLeftWidth:0,  borderBottomWidth:0 },
  bl:     { bottom:10, left:10,  borderRightWidth:0, borderTopWidth:0 },
  br:     { bottom:10, right:10, borderLeftWidth:0,  borderTopWidth:0 },
});

// ─── Stat Box ─────────────────────────────────────────────────────────────────
function StatBox({ icon, value, label }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statValue} numberOfLines={1}>{value || '—'}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Athlete Card (pure display) ──────────────────────────────────────────────
function AthleteCard({ athlete, style, isTop }) {
  const name    = athlete.displayName || `${athlete.ad||''} ${athlete.soyad||''}`.trim() || '?';
  const sport   = athlete.sporDali  || 'Spor';
  const city    = athlete.sehir     || '—';
  const age     = athlete.yas       || '—';
  const club    = athlete.kulup     || '—';
  const sgd     = typeof athlete.sgdScore === 'number' ? athlete.sgdScore : 0;
  const initial = name[0]?.toUpperCase() || '?';
  const ac      = accent(name);
  const sCol    = sgdColor(sgd);

  return (
    <Animated.View style={[s.card, style]}>
      {/* Card inner bg gradient layers */}
      <View style={[s.cardGradTop, { backgroundColor: ac + '18' }]} />
      <View style={s.cardGradBot} />

      <CornerDecor color={isTop ? ac : C.dim} />

      {/* TOP CHIPS */}
      <View style={s.topChips}>
        <View style={[s.chip, { backgroundColor: ac + '22', borderColor: ac }]}>
          <Text style={[s.chipText, { color: ac }]}>{sportIcon(sport)} {sport.toUpperCase()}</Text>
        </View>
        <View style={[s.chip, { backgroundColor: '#c9a22722', borderColor: C.gold }]}>
          <Text style={[s.chipText, { color: C.gold }]}>SGD {sgd}</Text>
        </View>
      </View>

      {/* Category badge */}
      <View style={s.catRow}>
        <View style={[s.catBadge, { backgroundColor: C.sec + '33' }]}>
          <Text style={s.catText}>{catOf(sport).toUpperCase()}</Text>
        </View>
      </View>

      {/* AVATAR */}
      <View style={s.avatarWrap}>
        <View style={[s.avatarOuter, { borderColor: ac, shadowColor: ac }]}>
          <View style={[s.avatarInner, { backgroundColor: ac + '33' }]}>
            <Text style={[s.avatarLetter, { color: ac }]}>{initial}</Text>
          </View>
        </View>
      </View>

      {/* ATHLETE INFO */}
      <Text style={s.athleteName} numberOfLines={1}>{name}</Text>
      <View style={s.infoRow}>
        <Text style={s.infoText}>📍 {city}</Text>
        <Text style={s.infoDot}>·</Text>
        <Text style={s.infoText}>🎂 {age}</Text>
        <Text style={s.infoDot}>·</Text>
        <Text style={s.infoText}>🏢 {club}</Text>
      </View>

      {/* STATS ROW */}
      <View style={s.statsRow}>
        <StatBox icon="🎂" value={String(age)} label="Yaş" />
        <View style={s.statDivider} />
        <StatBox icon="🏢" value={club} label="Kulüp" />
        <View style={s.statDivider} />
        <StatBox icon="📍" value={city} label="Şehir" />
      </View>

      {/* BOTTOM BAND */}
      <View style={[s.bottomBand, { borderTopColor: ac + '44' }]}>
        <View style={s.bandLeft}>
          <Text style={[s.premText, { color: ac }]}>★ Y SPORTS SCOUT</Text>
        </View>
        <View style={s.bandRight}>
          <Text style={s.cardNum}>#{(athlete.id || '000000').slice(-6).toUpperCase()}</Text>
          <Text style={[s.cardDate, { color: C.text2 }]}>
            {new Date().toLocaleDateString('tr-TR', { month:'short', year:'numeric' })}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Athlete Detail Modal ─────────────────────────────────────────────────────
function AthleteModal({ athlete, visible, onClose, onScout, uid }) {
  if (!athlete) return null;
  const name  = athlete.displayName || `${athlete.ad||''} ${athlete.soyad||''}`.trim() || '?';
  const sport = athlete.sporDali || '—';
  const city  = athlete.sehir    || '—';
  const age   = athlete.yas      || '—';
  const club  = athlete.kulup    || '—';
  const sgd   = typeof athlete.sgdScore === 'number' ? athlete.sgdScore : 0;
  const ac    = accent(name);
  const sCol  = sgdColor(sgd);
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          {/* Handle */}
          <View style={m.handle} />

          {/* Avatar + Name */}
          <View style={[m.avatarOuter, { borderColor: ac, shadowColor: ac }]}>
            <View style={[m.avatarInner, { backgroundColor: ac + '33' }]}>
              <Text style={[m.avatarLetter, { color: ac }]}>{initial}</Text>
            </View>
          </View>
          <Text style={m.name}>{name}</Text>
          <View style={[m.sportChip, { backgroundColor: ac + '22', borderColor: ac }]}>
            <Text style={[m.sportChipText, { color: ac }]}>{sportIcon(sport)} {sport}</Text>
          </View>

          {/* SGD Score */}
          <View style={[m.sgdBox, { borderColor: sCol + '55' }]}>
            <Text style={[m.sgdNum, { color: sCol }]}>{sgd}</Text>
            <Text style={m.sgdLabel}>SGD Skoru</Text>
          </View>

          {/* Detail rows */}
          {[
            ['📍 Şehir', city],
            ['🎂 Yaş', String(age)],
            ['🏢 Kulüp', club],
            ['⚡ Spor', sport],
            ['🏷️ Kategori', catOf(sport)],
          ].map(([label, val]) => (
            <View key={label} style={m.row}>
              <Text style={m.rowLabel}>{label}</Text>
              <Text style={m.rowVal}>{val}</Text>
            </View>
          ))}

          {/* Actions */}
          <TouchableOpacity style={[m.btn, { backgroundColor: C.green }]} onPress={onScout}>
            <Text style={m.btnText}>💚 Scout Listeme Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[m.btn, { backgroundColor: C.dim, marginTop: 8 }]} onPress={onClose}>
            <Text style={[m.btnText, { color: C.text2 }]}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────
function FilterModal({ visible, selected, onSelect, onClose }) {
  const [local, setLocal] = useState(selected);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={[m.sheet, { paddingBottom: 32 }]}>
          <View style={m.handle} />
          <Text style={m.filterTitle}>🔎 Filtrele</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {SPORTS.map(sp => (
              <TouchableOpacity
                key={sp}
                style={[m.filterRow, local === sp && { backgroundColor: C.purple + '22' }]}
                onPress={() => setLocal(sp)}
              >
                <Text style={[m.filterText, local === sp && { color: C.purple }]}>
                  {sp === 'Tümü' ? '🌐 Tümü' : `${sportIcon(sp)} ${sp}`}
                </Text>
                {local === sp && <Text style={{ color: C.purple }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[m.btn, { backgroundColor: C.purple, marginTop: 16 }]}
            onPress={() => { onSelect(local); onClose(); }}
          >
            <Text style={m.btnText}>Uygula</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Done State ───────────────────────────────────────────────────────────────
function DoneScreen({ matchCount, passCount, onReset, onViewList }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }).start();
  }, []);
  return (
    <View style={s.doneWrap}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Text style={s.doneTrophy}>🏆</Text>
      </Animated.View>
      <Text style={s.doneTitle}>Scout Tamamlandı!</Text>
      <Text style={s.doneSub}>Tüm sporcuları değerlendirdiniz</Text>
      <View style={s.doneStats}>
        <View style={s.doneStatBox}>
          <Text style={[s.doneStatNum, { color: C.green }]}>{matchCount}</Text>
          <Text style={s.doneStatLabel}>Match</Text>
        </View>
        <View style={s.doneStatDivider} />
        <View style={s.doneStatBox}>
          <Text style={[s.doneStatNum, { color: C.red }]}>{passCount}</Text>
          <Text style={s.doneStatLabel}>Pass</Text>
        </View>
      </View>
      <TouchableOpacity style={[s.doneBtn, { backgroundColor: C.green }]} onPress={onViewList}>
        <Text style={s.doneBtnText}>💚 Scout Listemi Gör</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.doneBtn, { backgroundColor: C.dim, marginTop: 10 }]} onPress={onReset}>
        <Text style={[s.doneBtnText, { color: C.text2 }]}>🔄 Yeniden Başla</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ScoutFeedScreen({ navigation }) {
  const [loading,    setLoading]    = useState(true);
  const [athletes,   setAthletes]   = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [idx,        setIdx]        = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [passCount,  setPassCount]  = useState(0);
  const [uid,        setUid]        = useState(null);
  const [modalAth,   setModalAth]   = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterSp,   setFilterSp]   = useState('Tümü');
  const [swiping,    setSwiping]    = useState(false);

  // Swipe animation values — refs to avoid re-renders
  const pan        = useRef(new Animated.Value(0)).current;
  const tilt       = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const nextScale  = useRef(new Animated.Value(0.92)).current;
  const nextOp     = useRef(new Animated.Value(0.4)).current;
  const thirdScale = useRef(new Animated.Value(0.86)).current;
  const thirdOp   = useRef(new Animated.Value(0.2)).current;

  // ─ Load athletes ─
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await auth.authStateReady();
        const u = auth.currentUser;
        if (u) setUid(u.uid);

        const db   = getFirestore(getApp());
        const snap = await getDocs(query(
          collection(db, 'sporcular'),
          orderBy('updatedAt', 'desc'),
          limit(100),
        ));
        if (cancelled) return;
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAthletes(list);
        setFiltered(list);
      } catch (e) {
        console.warn('ScoutFeed load:', e.message);
        Alert.alert('Hata', 'Sporcular yüklenemedi.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ─ Apply filter ─
  useEffect(() => {
    const list = filterSp === 'Tümü'
      ? athletes
      : athletes.filter(a => a.sporDali === filterSp);
    setFiltered(list);
    setIdx(0);
    resetAnimValues();
  }, [filterSp, athletes]);

  const resetAnimValues = useCallback(() => {
    pan.setValue(0);
    tilt.setValue(0);
    cardOpacity.setValue(1);
    nextScale.setValue(0.92);
    nextOp.setValue(0.4);
    thirdScale.setValue(0.86);
    thirdOp.setValue(0.2);
  }, []);

  // ─ PanResponder ─
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderGrant: () => setSwiping(true),
      onPanResponderMove: (_, g) => {
        pan.setValue(g.dx);
        // tilt: ±15° max
        tilt.setValue(g.dx / W * 15);
        // next card scales up as we drag
        const prog = Math.min(Math.abs(g.dx) / SWIPE_THRESHOLD, 1);
        nextScale.setValue(0.92 + prog * 0.08);
        nextOp.setValue(0.4 + prog * 0.6);
        thirdScale.setValue(0.86 + prog * 0.06);
        thirdOp.setValue(0.2 + prog * 0.2);
      },
      onPanResponderRelease: (_, g) => {
        setSwiping(false);
        if (g.dx > SWIPE_THRESHOLD) {
          flyOut('right');
        } else if (g.dx < -SWIPE_THRESHOLD) {
          flyOut('left');
        } else {
          // snap back
          Animated.parallel([
            Animated.spring(pan,   { toValue: 0, useNativeDriver: true }),
            Animated.spring(tilt,  { toValue: 0, useNativeDriver: true }),
            Animated.spring(nextScale, { toValue: 0.92, useNativeDriver: true }),
            Animated.spring(nextOp,    { toValue: 0.4,  useNativeDriver: true }),
            Animated.spring(thirdScale,{ toValue: 0.86, useNativeDriver: true }),
            Animated.spring(thirdOp,   { toValue: 0.2,  useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  const flyOut = useCallback((dir) => {
    const dest = dir === 'right' ? W * 1.5 : -W * 1.5;
    Animated.parallel([
      Animated.spring(pan,  { toValue: dest, useNativeDriver: true, velocity: 8, tension: 40, friction: 6 }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      // commit action
      setIdx(prev => {
        const cur = filtered[prev];
        if (dir === 'right') {
          setMatchCount(c => c + 1);
          saveMatch(cur, false);
        } else {
          setPassCount(c => c + 1);
        }
        return prev + 1;
      });
      // reset for next card
      resetAnimValues();
    });
  }, [filtered, uid]);

  const saveMatch = useCallback(async (athlete, superMatch) => {
    if (!uid || !athlete) return;
    try {
      const db = getFirestore(getApp());
      await addDoc(collection(db, 'matches'), {
        scoutId:     uid,
        athleteId:   athlete.id,
        athleteName: athlete.displayName || `${athlete.ad||''} ${athlete.soyad||''}`.trim(),
        sport:       athlete.sporDali,
        city:        athlete.sehir,
        sgdScore:    athlete.sgdScore,
        superMatch:  !!superMatch,
        status:      'pending',
        matchedAt:   serverTimestamp(),
      });
    } catch (e) {
      console.warn('saveMatch:', e.message);
    }
  }, [uid]);

  const handleMatch      = useCallback(() => flyOut('right'), [flyOut]);
  const handlePass       = useCallback(() => flyOut('left'),  [flyOut]);
  const handleSuperMatch = useCallback(() => {
    const cur = filtered[idx];
    if (!cur) return;
    setMatchCount(c => c + 1);
    saveMatch(cur, true);
    setIdx(prev => prev + 1);
    resetAnimValues();
  }, [filtered, idx, saveMatch, resetAnimValues]);

  const handleReset = useCallback(() => {
    setIdx(0);
    setMatchCount(0);
    setPassCount(0);
    resetAnimValues();
  }, [resetAnimValues]);

  const handleViewList = useCallback(async () => {
    if (!uid) return;
    try {
      const db   = getFirestore(getApp());
      const snap = await getDocs(query(
        collection(db, 'matches'),
        where('scoutId', '==', uid),
        orderBy('matchedAt', 'desc'),
        limit(20),
      ));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      Alert.alert(
        `Scout Listem (${list.length})`,
        list.slice(0, 8).map(m =>
          `${m.superMatch ? '⭐' : '💚'} ${m.athleteName || '?'} — ${m.sport || ''}`
        ).join('\n') || 'Henüz match yok',
      );
    } catch (e) {
      console.warn('viewList:', e.message);
    }
  }, [uid]);

  // ─ Swipe label opacities ─
  const matchLabelOp = pan.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const passLabelOp  = pan.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const rotate       = tilt.interpolate({ inputRange: [-15, 15], outputRange: ['-15deg', '15deg'] });

  const total   = filtered.length;
  const done    = idx >= total;
  const cur     = filtered[idx];
  const next    = filtered[idx + 1];
  const third   = filtered[idx + 2];
  const progress = total > 0 ? Math.min(idx / total, 1) : 0;

  // ─ Loading ─
  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={s.center}>
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={s.loadingText}>Sporcular yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>🔍 SCOUT FEED</Text>
          <Text style={s.headerSub}>{filterSp === 'Tümü' ? 'Tüm Spor Dalları' : filterSp}</Text>
        </View>
        <View style={s.headerRight}>
          <View style={s.matchBadge}>
            <Text style={s.matchBadgeText}>💚 {matchCount}</Text>
          </View>
          <TouchableOpacity style={s.filterBtn} onPress={() => setShowFilter(true)}>
            <Text style={s.filterBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── PROGRESS BAR ── */}
      <View style={s.progressOuter}>
        <View style={[s.progressInner, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={s.progressLabel}>{idx} / {total} sporcu</Text>

      {/* ── CARD STACK or DONE ── */}
      {done ? (
        <DoneScreen
          matchCount={matchCount}
          passCount={passCount}
          onReset={handleReset}
          onViewList={handleViewList}
        />
      ) : (
        <View style={s.stackArea}>

          {/* 3rd card (bottom) */}
          {third && (
            <Animated.View
              style={[s.card, s.cardBehind2, {
                transform: [{ scale: thirdScale }, { translateY: -24 }],
                opacity: thirdOp,
              }]}
            >
              <AthleteCard athlete={third} isTop={false} />
            </Animated.View>
          )}

          {/* 2nd card */}
          {next && (
            <Animated.View
              style={[s.card, s.cardBehind1, {
                transform: [{ scale: nextScale }, { translateY: -12 }],
                opacity: nextOp,
              }]}
            >
              <AthleteCard athlete={next} isTop={false} />
            </Animated.View>
          )}

          {/* Top card (swipeable) */}
          {cur && (
            <Animated.View
              style={[s.card, {
                transform: [{ translateX: pan }, { rotate }],
                opacity: cardOpacity,
                zIndex: 10,
              }]}
              {...panResponder.panHandlers}
            >
              <AthleteCard athlete={cur} isTop />

              {/* MATCH label */}
              <Animated.View style={[s.matchLabel, { opacity: matchLabelOp }]}>
                <Text style={s.matchLabelText}>MATCH 💚</Text>
              </Animated.View>

              {/* PASS label */}
              <Animated.View style={[s.passLabel, { opacity: passLabelOp }]}>
                <Text style={s.passLabelText}>PASS ✕</Text>
              </Animated.View>
            </Animated.View>
          )}
        </View>
      )}

      {/* ── ACTION BUTTONS ── */}
      {!done && (
        <View style={s.actions}>
          {/* PASS */}
          <TouchableOpacity
            style={[s.actionBtn, s.actionLarge, { borderColor: C.red, shadowColor: C.red }]}
            onPress={handlePass}
          >
            <Text style={s.actionIcon}>✕</Text>
          </TouchableOpacity>

          {/* SUPER MATCH */}
          <TouchableOpacity
            style={[s.actionBtn, s.actionSmall, { borderColor: C.gold, shadowColor: C.gold }]}
            onPress={handleSuperMatch}
          >
            <Text style={[s.actionIcon, { fontSize: 22 }]}>⭐</Text>
          </TouchableOpacity>

          {/* INFO */}
          <TouchableOpacity
            style={[s.actionBtn, s.actionSmall, { borderColor: C.primary, shadowColor: C.primary }]}
            onPress={() => setModalAth(cur)}
          >
            <Text style={[s.actionIcon, { fontSize: 20 }]}>ℹ️</Text>
          </TouchableOpacity>

          {/* MATCH */}
          <TouchableOpacity
            style={[s.actionBtn, s.actionLarge, { borderColor: C.green, shadowColor: C.green }]}
            onPress={handleMatch}
          >
            <Text style={s.actionIcon}>♥</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── MODALS ── */}
      <AthleteModal
        athlete={modalAth}
        visible={!!modalAth}
        onClose={() => setModalAth(null)}
        onScout={() => { saveMatch(modalAth, false); setModalAth(null); Alert.alert('✓', 'Scout listene eklendi!'); }}
        uid={uid}
      />

      <FilterModal
        visible={showFilter}
        selected={filterSp}
        onSelect={setFilterSp}
        onClose={() => setShowFilter(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_H = H * 0.56;
const CARD_W = W - 32;

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.text2, marginTop: 12, fontSize: 14 },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { color: C.white, fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  headerSub:   { color: C.text2, fontSize: 12, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matchBadge:  { backgroundColor: C.green + '22', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.green + '55' },
  matchBadgeText: { color: C.green, fontSize: 13, fontWeight: '700' },
  filterBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: C.dim, alignItems: 'center', justifyContent: 'center' },
  filterBtnText: { fontSize: 16 },

  // Progress
  progressOuter: { height: 3, backgroundColor: C.dim, marginHorizontal: 20, borderRadius: 2 },
  progressInner: { height: 3, backgroundColor: C.purple, borderRadius: 2 },
  progressLabel: { color: C.text2, fontSize: 11, textAlign: 'center', marginTop: 4, marginBottom: 8 },

  // Stack area
  stackArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Card base
  card: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.dim,
    overflow: 'hidden',
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  cardBehind1: { zIndex: 5 },
  cardBehind2: { zIndex: 1 },

  // Card gradient layers
  cardGradTop: { position: 'absolute', top: 0, left: 0, right: 0, height: CARD_H * 0.45 },
  cardGradBot: { position: 'absolute', bottom: 0, left: 0, right: 0, height: CARD_H * 0.5, backgroundColor: '#00000055' },

  // Top chips
  topChips: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, zIndex: 2 },
  chip:     { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  chipText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  // Category
  catRow:   { alignItems: 'center', marginTop: 6, zIndex: 2 },
  catBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 2 },
  catText:  { color: C.text2, fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  // Avatar
  avatarWrap: { alignItems: 'center', marginTop: 10, zIndex: 2 },
  avatarOuter: {
    width: 84, height: 84, borderRadius: 42, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8,
  },
  avatarInner: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 34, fontWeight: '900' },

  // Athlete info
  athleteName: { color: C.white, fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 10, paddingHorizontal: 16, zIndex: 2 },
  infoRow:     { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 4, marginTop: 4, paddingHorizontal: 12, zIndex: 2 },
  infoText:    { color: C.text2, fontSize: 12 },
  infoDot:     { color: C.dim, fontSize: 12 },

  // Stats row
  statsRow:    { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, backgroundColor: C.bg + 'aa', borderRadius: 12, paddingVertical: 10, zIndex: 2 },
  statBox:     { flex: 1, alignItems: 'center' },
  statIcon:    { fontSize: 14, marginBottom: 2 },
  statValue:   { color: C.white, fontSize: 13, fontWeight: '800' },
  statLabel:   { color: C.text2, fontSize: 10, marginTop: 1 },
  statDivider: { width: 1, backgroundColor: C.dim, marginVertical: 4 },

  // Bottom band
  bottomBand:  { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, backgroundColor: '#000000aa' },
  bandLeft:    {},
  bandRight:   { alignItems: 'flex-end' },
  premText:    { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  cardNum:     { color: C.text2, fontSize: 10, fontWeight: '700' },
  cardDate:    { fontSize: 9, marginTop: 2 },

  // Swipe labels
  matchLabel: {
    position: 'absolute', top: 24, left: 16,
    borderWidth: 2, borderColor: C.green, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4,
    transform: [{ rotate: '-30deg' }],
    backgroundColor: C.green + '22',
  },
  matchLabelText: { color: C.green, fontSize: 22, fontWeight: '900' },
  passLabel: {
    position: 'absolute', top: 24, right: 16,
    borderWidth: 2, borderColor: C.red, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4,
    transform: [{ rotate: '30deg' }],
    backgroundColor: C.red + '22',
  },
  passLabelText: { color: C.red, fontSize: 22, fontWeight: '900' },

  // Action buttons
  actions:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 16 },
  actionBtn:   {
    alignItems: 'center', justifyContent: 'center', borderRadius: 999,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8,
    backgroundColor: C.card,
  },
  actionLarge: { width: 68, height: 68 },
  actionSmall: { width: 52, height: 52 },
  actionIcon:  { fontSize: 26, color: C.white },

  // Done screen
  doneWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  doneTrophy:    { fontSize: 72, textAlign: 'center' },
  doneTitle:     { color: C.white, fontSize: 24, fontWeight: '900', marginTop: 16, textAlign: 'center' },
  doneSub:       { color: C.text2, fontSize: 14, marginTop: 6, textAlign: 'center' },
  doneStats:     { flexDirection: 'row', marginTop: 28, backgroundColor: C.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.dim },
  doneStatBox:   { alignItems: 'center', paddingHorizontal: 24 },
  doneStatNum:   { fontSize: 36, fontWeight: '900' },
  doneStatLabel: { color: C.text2, fontSize: 13, marginTop: 4 },
  doneStatDivider: { width: 1, backgroundColor: C.dim },
  doneBtn:       { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  doneBtnText:   { color: C.white, fontSize: 16, fontWeight: '800' },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: '#000000cc', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#111827', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, maxHeight: H * 0.82 },
  handle:     { width: 40, height: 4, backgroundColor: C.dim, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },

  // Athlete modal
  avatarOuter: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', shadowOffset:{ width:0,height:0 }, shadowOpacity:0.8, shadowRadius:10, elevation:8 },
  avatarInner: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarLetter:{ fontSize: 28, fontWeight: '900' },
  name:       { color: C.white, fontSize: 20, fontWeight: '900', textAlign: 'center', marginTop: 10 },
  sportChip:  { alignSelf: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, marginTop: 6 },
  sportChipText: { fontSize: 13, fontWeight: '700' },
  sgdBox:     { alignItems: 'center', marginVertical: 16, borderWidth: 1, borderRadius: 12, paddingVertical: 10 },
  sgdNum:     { fontSize: 40, fontWeight: '900' },
  sgdLabel:   { color: C.text2, fontSize: 12, marginTop: 2 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.dim },
  rowLabel:   { color: C.text2, fontSize: 13 },
  rowVal:     { color: C.white, fontSize: 13, fontWeight: '600' },
  btn:        { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  btnText:    { color: C.white, fontSize: 15, fontWeight: '800' },

  // Filter modal
  filterTitle: { color: C.white, fontSize: 18, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  filterRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderRadius: 8, paddingHorizontal: 8 },
  filterText:  { color: C.text2, fontSize: 15 },
});
