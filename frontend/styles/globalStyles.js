// styles/globalStyles.js
// Styles we can import 
import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  // ========================//
  // ========================//
  // Layout Helpers          //
  // ========================//
  container: { flex: 1, paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  spacedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },

  // ========================//
  // Header                  //
  // ========================//
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  welcomeText: { fontWeight: '600', fontSize: 18, fontFamily: 'Montserrat_700Bold' },
  profileCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  // ========================//
  // Calendar / Date selector//
  // ========================//
  dateRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12 },
  dateCircle: { width: 50, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dateCircleActive: { backgroundColor: '#444' },
  dayText: { fontSize: 12, marginBottom: 2, fontFamily: 'Montserrat_400Regular' },

  // ========================//
  // Banner                  //
  // ========================//
  bannerImage: { width: '90%', height: 180, borderRadius: 12, alignSelf: 'center', marginVertical: 12 },

  // ========================//
  // Premium card            //
  // ========================//
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    alignSelf: 'center',
    width: '90%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  premiumText: { marginLeft: 8, fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_700Bold' },

  // ========================//
  // Grid / Cards            //
  // ========================//
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardText: { fontWeight: '600', fontSize: 16, fontFamily: 'Montserrat_700Bold' },

  // ========================//
  // Bottom nav              //
  // ========================//
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: { 
    alignItems: 'center' 
  },
  navText: { 
    fontSize: 12, 
    marginTop: 2, 
    fontFamily: 'Montserrat_700Bold' 
  },
});

export default globalStyles;
