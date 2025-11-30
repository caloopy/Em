'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Logo } from '@/components/shared/Logo'
import { Mail, Lock, User, ArrowRight, AtSign, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/Crop/utils'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useUsername } from '@/hooks/use-username'
import { useLanguage } from '@/hooks/use-language'
import LanguageSelector from '@/components/language/LanguageSelector'
import { MotivationNotification } from '@/components/motivation/MotivationNotification'

// --- Component Definition 🚀 ---

export default function AuthSplashPage() {
  // --- State Management ---
  const [isLoadingSplash, setIsLoadingSplash] = useState(true)
  const [isFadingOutSplash, setIsFadingOutSplash] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMotivation, setShowMotivation] = useState(false)
  const [motivationType, setMotivationType] = useState<'login' | 'signup'>('login')

  // Sign Up form state
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpUsername, setSignUpUsername] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  // Login form state
  const [loginUsernameOrEmail, setLoginUsernameOrEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // --- Hooks and Contexts ---
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  // Destructuring functions from the custom hooks
  const { checkUsernameAvailability, registerUser, loginUser } = useUsername()
  const { t, isRtl } = useLanguage()

  // --- Effects ---

  // 1. Check username availability as user types (FIXED: Added async wrapper)
  useEffect(() => {
    const checkAvailability = async () => {
      if (signUpUsername.length >= 3) {
        // Await the asynchronous hook function
        const isAvailable = await checkUsernameAvailability(signUpUsername)
        setUsernameAvailable(isAvailable)
      } else {
        setUsernameAvailable(null)
      }
    }
    checkAvailability()
    // NOTE: checkUsernameAvailability is stable via useCallback in the hook, so safe dependency
  }, [signUpUsername, checkUsernameAvailability])

  // 2. Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // 3. Splash Screen Timer
  useEffect(() => {
    const splashDuration = 200 // Initial display duration
    const fadeOutDuration = 100 // Fade transition duration

    const timer = setTimeout(() => {
      setIsFadingOutSplash(true)
      setTimeout(() => {
        setIsLoadingSplash(false)
        setIsFadingOutSplash(false)
      }, fadeOutDuration)
    }, splashDuration)

    return () => clearTimeout(timer)
  }, [])

  // --- Handlers ---

  const handleAuthSuccess = (type: 'login' | 'signup') => {
    setIsSubmitting(false)
    setMotivationType(type)
    setShowMotivation(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const handleDemoAccess = () => {
    toast({
      title: t('auth.welcomeDemo'),
      description: t('auth.demoDescription'),
    })
    setShowMotivation(true)
    setMotivationType('login')
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const handleSignUpSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // FIX: Corrected function call to match useUsername hook signature (email, username, password)
      await registerUser(signUpEmail, signUpUsername, signUpPassword)

      toast({
        title: t('auth.accountCreated'),
        description: t('auth.signupSuccess'),
      })

      // Clear form states
      setSignUpName('')
      setSignUpEmail('')
      setSignUpUsername('')
      setSignUpPassword('')
      
      handleAuthSuccess('signup')
    } catch (error) {
      setIsSubmitting(false)
      // Display error toast if registration fails on the backend
      toast({
        title: t('auth.registrationFailed'),
        description: t('auth.genericError'),
        variant: 'destructive',
      })
      console.error('Registration failed:', error)
      // NOTE: Original code always showed success, but standard practice is to show the actual failure.
    }
  }

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await loginUser(loginUsernameOrEmail, loginPassword)

      toast({
        title: t('auth.welcomeBackToast'),
        description: t('auth.loginSuccess'),
      })

      // Clear form states
      setLoginUsernameOrEmail('')
      setLoginPassword('')
      
      handleAuthSuccess('login')
    } catch (error) {
      setIsSubmitting(false)
      // Display error toast if login fails on the backend
      toast({
        title: t('auth.loginFailed'),
        description: t('auth.invalidCredentials'),
        variant: 'destructive',
      })
      console.error('Login failed:', error)
      // NOTE: Original code always showed success, but standard practice is to show the actual failure.
    }
  }

  // --- Conditional Renders (Loading/Redirecting) ---

  // Display while authentication status is being checked
  if (authLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground p-4',
          isRtl && 'rtl',
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <Logo iconSize="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32" iconOnly={true} />
          </div>
          <div className="relative animate-pulse">
            <Logo iconSize="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32" iconOnly={true} />
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
          <p className="text-muted-foreground animate-pulse font-medium">{t('status.loadingLlevo')}</p>
        </div>
      </div>
    )
  }

  // Display if user is authenticated (before redirect)
  if (user) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground p-4',
          isRtl && 'rtl',
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <Logo iconSize="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32" iconOnly={true} />
          </div>
          <div className="relative animate-pulse">
            <Logo iconSize="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32" iconOnly={true} />
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
          <p className="text-muted-foreground animate-pulse font-medium">{t('status.redirectingDashboard')}</p>
        </div>
      </div>
    )
  }

  // Display Splash Screen
  if (isLoadingSplash) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground p-4 transition-opacity duration-300',
          isFadingOutSplash ? 'opacity-0' : 'opacity-100',
          isRtl && 'rtl',
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <Logo iconSize="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32" iconOnly={true} />
          </div>
          <div className="relative animate-pulse">
            <Logo iconSize="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32" iconOnly={true} />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
          <p className="text-muted-foreground animate-pulse font-medium">{t('status.initializingLlevo')}</p>
        </div>
      </div>
    )
  }

  // --- Main Auth Splash Page Render ---

  return (
    <div
      className={cn(
        'flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 selection:bg-primary/20 selection:text-primary',
        isRtl && 'rtl',
      )}
    >
      {/* Motivation Notification */}
      {showMotivation && (
        <MotivationNotification
          type={motivationType}
          message=""
          onClose={() => setShowMotivation(false)}
          duration={3000}
        />
      )}

      {/* Header Area (Language Selector and Logo) */}
      <div className={cn('absolute top-4 z-20', isRtl ? 'left-4' : 'right-4')}>
        <LanguageSelector variant="outline" size="sm" />
      </div>

      <div className={cn('absolute top-6 z-10', isRtl ? 'right-6 sm:right-8' : 'left-6 sm:left-8')}>
        <Logo iconSize="h-9 w-9 sm:h-10 sm:w-10" textSize="text-2xl sm:text-3xl" />
      </div>

      {/* Main Content Area */}
      <main className="flex flex-col items-center justify-center flex-grow p-4">
        <Card className="w-full max-w-md shadow-2xl rounded-2xl border-border/30 bg-card/80 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Tabs defaultValue="signup" className="w-full">
            <CardHeader className="text-center pt-8 pb-4">
              <TabsList className="grid w-full grid-cols-2 rounded-full mx-auto max-w-xs h-11 p-1.5 bg-muted/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <TabsTrigger
                  value="signup"
                  className="rounded-full text-sm py-2 transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-background"
                >
                  {t('auth.signUp')}
                </TabsTrigger>
                <TabsTrigger
                  value="login"
                  className="rounded-full text-sm py-2 transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-background"
                >
                  {t('auth.signIn')}
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* Sign Up Tab Content */}
            <TabsContent value="signup" className="animate-in fade-in-0 duration-300">
              <form onSubmit={handleSignUpSubmit}>
                <CardHeader className="pt-2 pb-4 text-center">
                  <CardTitle className="text-2xl text-foreground">{t('auth.joinLlevo')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('auth.signUpSubtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-6">
                  {/* Full Name Input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-foreground">
                      {t('auth.fullName')}
                    </Label>
                    <div className="relative">
                      <User
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground',
                          isRtl ? 'right-3' : 'left-3',
                        )}
                      />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={t('auth.enterFullName')}
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        required
                        className={cn(
                          'h-11 rounded-lg text-base bg-background/50 border-border focus:bg-card transition-colors duration-200',
                          isRtl ? 'pr-10' : 'pl-10',
                        )}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  {/* Username Input with Availability Check */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-username" className="text-foreground">
                      {t('auth.username')}
                    </Label>
                    <div className="relative">
                      <AtSign
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground',
                          isRtl ? 'right-3' : 'left-3',
                        )}
                      />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder={t('auth.chooseUsername')}
                        value={signUpUsername}
                        // Enforce lowercase and filter non-alphanumeric/underscore characters
                        onChange={(e) => setSignUpUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        required
                        minLength={3}
                        maxLength={20}
                        className={cn(
                          'h-11 rounded-lg text-base bg-background/50 border-border focus:bg-card transition-colors duration-200',
                          isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10',
                          usernameAvailable === true && 'border-green-500 focus:border-green-500',
                          usernameAvailable === false && 'border-red-500 focus:border-red-500',
                        )}
                        disabled={isSubmitting}
                      />
                      {/* Availability Icon */}
                      {signUpUsername.length >= 3 && (
                        <div className={cn('absolute top-1/2 -translate-y-1/2', isRtl ? 'left-3' : 'right-3')}>
                          {usernameAvailable === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {usernameAvailable === false && <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                      )}
                    </div>
                    {/* Availability Message */}
                    {signUpUsername.length >= 3 && (
                      <p
                        className={cn(
                          'text-xs',
                          usernameAvailable === true && 'text-green-600',
                          usernameAvailable === false && 'text-red-600',
                        )}
                      >
                        {usernameAvailable === true && t('auth.usernameAvailable')}
                        {usernameAvailable === false && t('auth.usernameTaken')}
                      </p>
                    )}
                  </div>
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-foreground">
                      {t('auth.email')}
                    </Label>
                    <div className="relative">
                      <Mail
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground',
                          isRtl ? 'right-3' : 'left-3',
                        )}
                      />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t('auth.enterEmail')}
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        className={cn(
                          'h-11 rounded-lg text-base bg-background/50 border-border focus:bg-card transition-colors duration-200',
                          isRtl ? 'pr-10' : 'pl-10',
                        )}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-foreground">
                      {t('auth.password')}
                    </Label>
                    <div className="relative">
                      <Lock
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground',
                          isRtl ? 'right-3' : 'left-3',
                        )}
                      />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder={t('auth.enterPassword')}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        minLength={6}
                        className={cn(
                          'h-11 rounded-lg text-base bg-background/50 border-border focus:bg-card transition-colors duration-200',
                          isRtl ? 'pr-10' : 'pl-10',
                        )}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardContent className="px-6 pb-8">
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-full text-base group bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          </div>
                          <span>{t('auth.creatingAccount')}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {t('auth.createAccount')}
                        <ArrowRight
                          className={cn(
                            'h-5 w-5 transition-transform duration-200 group-hover:translate-x-1',
                            isRtl ? 'mr-2 group-hover:-translate-x-1' : 'ml-2',
                          )}
                        />
                      </>
                    )}
                  </Button>
                  <p className="mt-4 text-center text-xs text-muted-foreground">{t('auth.termsAndPrivacy')}</p>
                </CardContent>
              </form>
            </TabsContent>

            {/* Login Tab Content */}
            <TabsContent value="login" className="animate-in fade-in-0 duration-300">
              <form onSubmit={handleLoginSubmit}>
                <CardHeader className="pt-2 pb-4 text-center">
                  <CardTitle className="text-2xl text-foreground">{t('auth.welcomeBack')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('auth.signInSubtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-6">
                  {/* Username/Email Input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="login-username-email" className="text-foreground">
                      {t('auth.username')} / {t('auth.email')}
                    </Label>
                    <div className="relative">
                      <AtSign
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground',
                          isRtl ? 'right-3' : 'left-3',
                        )}
                      />
                      <Input
                        id="login-username-email"
                        type="text"
                        placeholder={t('auth.usernameOrEmail')}
                        value={loginUsernameOrEmail}
                        onChange={(e) => setLoginUsernameOrEmail(e.target.value)}
                        required
                        className={cn(
                          'h-11 rounded-lg text-base bg-background/50 border-border focus:bg-card transition-colors duration-200',
                          isRtl ? 'pr-10' : 'pl-10',
                        )}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  {/* Password Input and Forgot Password Link */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-foreground">
                        {t('auth.password')}
                      </Label>
                      <a href="#" className="text-xs text-primary hover:underline transition-colors">
                        {t('auth.forgotPassword')}
                      </a>
                    </div>
                    <div className="relative">
                      <Lock
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground',
                          isRtl ? 'right-3' : 'left-3',
                        )}
                      />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t('auth.enterPassword')}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className={cn(
                          'h-11 rounded-lg text-base bg-background/50 border-border focus:bg-card transition-colors duration-200',
                          isRtl ? 'pr-10' : 'pl-10',
                        )}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardContent className="px-6 pb-8">
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-full text-base group bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          </div>
                          <span>{t('auth.signingIn')}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {t('auth.signIn')}
                        <ArrowRight
                          className={cn(
                            'h-5 w-5 transition-transform duration-200 group-hover:translate-x-1',
                            isRtl ? 'mr-2 group-hover:-translate-x-1' : 'ml-2',
                          )}
                        />
                      </>
                    )}
                  </Button>
                  {/* Demo Access Button */}
                  <div className="mt-4 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDemoAccess}
                      className="w-full h-10 rounded-full text-sm"
                    >
                      {t('auth.continueAsGuest')}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-muted-foreground py-4 shrink-0">
        &copy; {new Date().getFullYear()} LLEVO Learn. {t('footer.copyright')}
      </footer>
    </div>
  )
}